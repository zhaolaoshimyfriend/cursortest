import { deriveSignals } from "./signals.js";
import type {
  BooksPayload,
  FormDecision,
  FormSelectionResult,
  FormStatus,
  InquiryAnswers,
} from "./types.js";

function decision(
  form_code: string,
  form_name: string,
  status: FormStatus,
  reason: string,
  drivers: FormDecision["drivers"],
  basis: string
): FormDecision {
  return { form_code, form_name, status, reason, drivers, basis };
}

/**
 * select_forms per docs/annual-cit-form-selection-logic.md v0.2.
 * Hard rules:
 * - small micro: A101010/A102010/A104000 always skipped (never optional_filled)
 * - A106000 only when needs_loss_schedule
 * - A107041 required when HNTE cert valid in tax year
 * - RD/donation inquiry false → corresponding forms skipped
 */
export function selectForms(
  inquiry: InquiryAnswers,
  books: BooksPayload,
  taxpayerId: string | null = null
): FormSelectionResult {
  const forms: FormDecision[] = [];
  const signals = deriveSignals(inquiry, books);

  // Step 0: gate
  if (inquiry.is_cross_region === true || inquiry.has_overseas_income === true) {
    return {
      schema_version: "0.1",
      tax_year: inquiry.tax_year,
      taxpayer_id: taxpayerId,
      profile: {
        is_general_enterprise: !!inquiry.is_general_enterprise,
        is_small_micro: !!inquiry.is_small_micro,
        is_cross_region: !!inquiry.is_cross_region,
        has_overseas_income: !!inquiry.has_overseas_income,
      },
      pipeline_step: "select_forms",
      blocked: true,
      block_reason:
        "v1 画像锁定非跨地区、无境外所得；当前问询违反 v1_fixed，整单阻断，不产出完整选表。",
      ready_for_fill: false,
      forms: [],
      checklist_for_cover: [],
      summary: {
        required: 0,
        skipped: 0,
        optional_filled: 0,
        pending_data: 0,
      },
    };
  }

  // Step 1: identity / cover + main
  forms.push(
    decision(
      "A000000",
      "企业所得税年度纳税申报基础信息表",
      "required",
      inquiry.is_small_micro
        ? "每次汇算必填基础信息表；小型微利企业按国家税务总局公告2018年第58号第二条，主要股东及分红情况区免填，但本表仍须报送。"
        : "每次汇算必填基础信息表（表样「填报表单」印√）。",
      {
        inquiry_fields: ["is_small_micro", "enterprise_type_code"],
        input_tables: [],
        signals: [`is_small_micro=${inquiry.is_small_micro}`],
      },
      "表样《填报表单》；国家税务总局公告2018年第58号"
    )
  );
  forms.push(
    decision(
      "A100000",
      "中华人民共和国企业所得税年度纳税申报表（A类）",
      "required",
      inquiry.is_small_micro
        ? "每次汇算必填主表；小微免填收入成本费用明细时，相关数据在主表直接填列。"
        : "每次汇算必填主表（表样「填报表单」印√）。",
      {
        inquiry_fields: ["is_small_micro"],
        input_tables: ["trial_balance", "income_statement", "prepaid_cit"],
        signals: [],
      },
      "表样《填报表单》；国家税务总局公告2018年第58号第一条"
    )
  );

  // Step 2: income/cost/expense detail — small micro hard skip
  const detailTriplet: Array<[string, string]> = [
    ["A101010", "一般企业收入明细表"],
    ["A102010", "一般企业成本支出明细表"],
    ["A104000", "期间费用明细表"],
  ];
  for (const [code, name] of detailTriplet) {
    if (inquiry.is_small_micro) {
      forms.push(
        decision(
          code,
          name,
          "skipped",
          "小型微利企业，按国家税务总局公告2018年第58号第三条免于填报；本产品禁止 optional_filled/required，营业收入等在A100000直接填列。",
          {
            inquiry_fields: ["is_small_micro"],
            input_tables: ["trial_balance"],
            signals: ["is_small_micro=true"],
          },
          "国家税务总局公告2018年第58号第三条；form-selection-logic v0.2 硬约束"
        )
      );
    } else if (inquiry.is_general_enterprise) {
      forms.push(
        decision(
          code,
          name,
          "required",
          "一般企业且非小型微利，有完整科目余额表时按表样适用范围填报收入/成本/期间费用明细。",
          {
            inquiry_fields: ["is_small_micro", "is_general_enterprise"],
            input_tables: ["trial_balance"],
            signals: ["is_small_micro=false", "is_general_enterprise=true"],
          },
          "表样适用范围；form-selection-logic §4.2"
        )
      );
    } else {
      forms.push(
        decision(
          code,
          name,
          "skipped",
          "非一般企业画像，不适用一般企业收入/成本/期间费用明细表。",
          {
            inquiry_fields: ["is_general_enterprise"],
            input_tables: [],
            signals: ["is_general_enterprise=false"],
          },
          "表样适用范围"
        )
      );
    }
  }

  // Step 3: tax adjustment subforms (occurrence-driven)
  // A105050
  if (signals.has_payroll) {
    forms.push(
      decision(
        "A105050",
        "职工薪酬支出及纳税调整明细表",
        "required",
        "发生职工薪酬支出，按填写说明须填报本表。",
        {
          inquiry_fields: [],
          input_tables: ["payroll_breakdown"],
          signals: ["has_payroll=true"],
        },
        "A105050填报说明：发生职工薪酬支出均需填报"
      )
    );
  } else if ((books.payroll_breakdown ?? []).length === 0) {
    forms.push(
      decision(
        "A105050",
        "职工薪酬支出及纳税调整明细表",
        "pending_data",
        "缺少职工薪酬拆分数据，无法判定是否发生薪酬支出。",
        {
          inquiry_fields: [],
          input_tables: ["payroll_breakdown"],
          signals: ["has_payroll=false"],
        },
        "form-selection-logic §4.3"
      )
    );
  } else {
    forms.push(
      decision(
        "A105050",
        "职工薪酬支出及纳税调整明细表",
        "skipped",
        "职工薪酬拆分表无发生额，判定无职工薪酬支出。",
        {
          inquiry_fields: [],
          input_tables: ["payroll_breakdown"],
          signals: ["has_payroll=false"],
        },
        "form-selection-logic §4.3"
      )
    );
  }

  // A105080
  if (signals.has_depr) {
    forms.push(
      decision(
        "A105080",
        "资产折旧、摊销及纳税调整明细表",
        "required",
        "发生资产折旧、摊销，按填写说明须填报本表。",
        {
          inquiry_fields: ["has_accelerated_depreciation"],
          input_tables: ["asset_register"],
          signals: ["has_depr=true"],
        },
        "A105080填报说明：发生折旧摊销均需填报"
      )
    );
  } else if ((books.asset_register ?? []).length === 0) {
    forms.push(
      decision(
        "A105080",
        "资产折旧、摊销及纳税调整明细表",
        "pending_data",
        "缺少资产台账，无法判定是否发生折旧摊销。",
        {
          inquiry_fields: [],
          input_tables: ["asset_register"],
          signals: ["has_depr=false"],
        },
        "form-selection-logic §4.3"
      )
    );
  } else {
    forms.push(
      decision(
        "A105080",
        "资产折旧、摊销及纳税调整明细表",
        "skipped",
        "资产台账无折旧摊销发生额，判定无需填报。",
        {
          inquiry_fields: [],
          input_tables: ["asset_register"],
          signals: ["has_depr=false"],
        },
        "form-selection-logic §4.3"
      )
    );
  }

  // A105070 donation — inquiry false + 0 rows => skipped; conflict => pending_data
  const donationFalse =
    inquiry.has_public_welfare_donation === false && signals.donation_rows === 0;
  const donationConflict =
    (inquiry.has_public_welfare_donation === true &&
      signals.donation_rows === 0) ||
    (inquiry.has_public_welfare_donation === false &&
      signals.donation_rows > 0);

  if (donationConflict) {
    forms.push(
      decision(
        "A105070",
        "捐赠支出及纳税调整明细表",
        "pending_data",
        "问询 has_public_welfare_donation 与 donation_list 行数不一致，须先对齐问询与清单后再选表。",
        {
          inquiry_fields: ["has_public_welfare_donation"],
          input_tables: ["donation_list"],
          signals: [
            `has_public_welfare_donation=${inquiry.has_public_welfare_donation}`,
            `donation_rows=${signals.donation_rows}`,
          ],
        },
        "data-contract 跨表校验；form-selection-logic §5.3"
      )
    );
  } else if (donationFalse) {
    forms.push(
      decision(
        "A105070",
        "捐赠支出及纳税调整明细表",
        "skipped",
        "问询声明无公益性捐赠且捐赠清单0行（无结转），不选填本表；强制输入文件可为空壳。",
        {
          inquiry_fields: ["has_public_welfare_donation"],
          input_tables: ["donation_list"],
          signals: ["has_donation=false", "donation_rows=0"],
        },
        "form-selection-logic §5.3"
      )
    );
  } else {
    forms.push(
      decision(
        "A105070",
        "捐赠支出及纳税调整明细表",
        "required",
        "发生捐赠支出（含结转），无论是否纳税调整均应填报本表，回写A105000第17行。",
        {
          inquiry_fields: ["has_public_welfare_donation"],
          input_tables: ["donation_list"],
          signals: [
            `has_donation=true`,
            `donation_rows=${signals.donation_rows}`,
          ],
        },
        "A105070填报说明；form-selection-logic §5.3"
      )
    );
  }

  // A105060 etc. — v1 default skipped
  forms.push(
    decision(
      "A105060",
      "广告费和业务宣传费跨年度纳税调整明细表",
      "skipped",
      "v1最小闭环未提供广告宣传费明细，暂不选填；对应A105000行可待补。",
      {
        inquiry_fields: [],
        input_tables: [],
        signals: [],
      },
      "form-selection-logic §4.3；v1后补"
    )
  );

  // Step 4: A105000 skeleton
  const adjustmentChildren = ["A105050", "A105080", "A105070", "A105060"];
  const hasAdjChild = forms.some(
    (f) =>
      adjustmentChildren.includes(f.form_code) &&
      (f.status === "required" || f.status === "optional_filled")
  );
  if (hasAdjChild) {
    forms.push(
      decision(
        "A105000",
        "纳税调整项目明细表",
        "required",
        "存在纳税调整子表需汇总回写主表第20–21行，故本表必填。",
        {
          inquiry_fields: [],
          input_tables: [],
          signals: ["has_tax_adjustment=true"],
        },
        "form-selection-logic §4.3"
      )
    );
  } else {
    forms.push(
      decision(
        "A105000",
        "纳税调整项目明细表",
        "skipped",
        "无纳税调整子表或调整事项，本表不选填。",
        {
          inquiry_fields: [],
          input_tables: [],
          signals: ["has_tax_adjustment=false"],
        },
        "form-selection-logic §4.3"
      )
    );
  }

  // Step 5: preference forms — A107012
  if (inquiry.claim_rd_super_deduction === false) {
    forms.push(
      decision(
        "A107012",
        "研发费用加计扣除优惠明细表",
        "skipped",
        "问询声明不享受研发费用加计扣除；强制输入的研发辅助账文件仅用于闭环，不出本表。",
        {
          inquiry_fields: ["claim_rd_super_deduction"],
          input_tables: ["rd_aux_ledger"],
          signals: ["claims_rd=false"],
        },
        "form-selection-logic §5.2"
      )
    );
  } else if (
    signals.rd_amount_positive &&
    inquiry.rd_ledger_style &&
    inquiry.rd_super_deduction_rate
  ) {
    forms.push(
      decision(
        "A107012",
        "研发费用加计扣除优惠明细表",
        "required",
        `享受研发费用加计扣除（可加计额${signals.rd_amount_sum.toFixed(2)}元），填报本表并回写主表第22行。`,
        {
          inquiry_fields: [
            "claim_rd_super_deduction",
            "rd_ledger_style",
            "rd_super_deduction_rate",
          ],
          input_tables: ["rd_aux_ledger"],
          signals: [
            "claims_rd=true",
            `rd_amount_positive=true`,
            `rd_amount_sum=${signals.rd_amount_sum}`,
          ],
        },
        "form-selection-logic §5.2"
      )
    );
  } else {
    forms.push(
      decision(
        "A107012",
        "研发费用加计扣除优惠明细表",
        "pending_data",
        "已声明享受研发加计，但辅助账可加计额为0或缺辅助账样式/加计比例，阻断自动填加计行。",
        {
          inquiry_fields: [
            "claim_rd_super_deduction",
            "rd_ledger_style",
            "rd_super_deduction_rate",
          ],
          input_tables: ["rd_aux_ledger"],
          signals: [
            "claims_rd=true",
            `rd_amount_positive=${signals.rd_amount_positive}`,
          ],
        },
        "form-selection-logic §5.2"
      )
    );
  }

  // A107011 / A107020 / A107050 / A107042
  forms.push(
    decision(
      "A107011",
      "符合条件的居民企业之间股息红利等权益性投资收益优惠明细表",
      inquiry.has_tax_exempt_dividends ? "required" : "skipped",
      inquiry.has_tax_exempt_dividends
        ? "问询声明有免税股息红利，须填报本表。"
        : "问询无免税股息红利，不选填本表。",
      {
        inquiry_fields: ["has_tax_exempt_dividends"],
        input_tables: [],
        signals: [`has_tax_exempt_dividends=${inquiry.has_tax_exempt_dividends}`],
      },
      "form-selection-logic §4.4"
    )
  );
  forms.push(
    decision(
      "A107020",
      "所得减免优惠明细表",
      inquiry.has_income_exemption ? "required" : "skipped",
      inquiry.has_income_exemption
        ? "问询声明有所得减免，须填报本表。"
        : "问询无所得减免，不选填本表。",
      {
        inquiry_fields: ["has_income_exemption"],
        input_tables: [],
        signals: [`has_income_exemption=${inquiry.has_income_exemption}`],
      },
      "form-selection-logic §4.4"
    )
  );

  // A107041 HNTE — valid in tax year => always required
  if (inquiry.is_hnte === false) {
    forms.push(
      decision(
        "A107041",
        "高新技术企业优惠情况及明细表",
        "skipped",
        "问询非高新技术企业，不选填本表。",
        {
          inquiry_fields: ["is_hnte"],
          input_tables: [],
          signals: ["is_hnte=false"],
        },
        "form-selection-logic §4.4 / v0.2"
      )
    );
  } else if (signals.hnte_cert_valid) {
    forms.push(
      decision(
        "A107041",
        "高新技术企业优惠情况及明细表",
        "required",
        "高新技术企业资格在申报所属期内有效，产品口径一律填报本表（不论本年是否实际享受高新减免）。",
        {
          inquiry_fields: ["is_hnte", "hnte_certificates"],
          input_tables: [],
          signals: ["hnte_cert_valid=true"],
        },
        "form-selection-logic v0.2 用户确认：有效期内一律 required"
      )
    );
  } else {
    forms.push(
      decision(
        "A107041",
        "高新技术企业优惠情况及明细表",
        "pending_data",
        signals.hnte_cert_missing
          ? "声明为高新技术企业但缺少证书信息，无法确认所属期有效性。"
          : "声明为高新技术企业但证书不在申报所属期内有效。",
        {
          inquiry_fields: ["is_hnte", "hnte_certificates"],
          input_tables: [],
          signals: [
            "is_hnte=true",
            `hnte_cert_valid=false`,
            `hnte_cert_missing=${signals.hnte_cert_missing}`,
          ],
        },
        "form-selection-logic §4.4"
      )
    );
  }

  forms.push(
    decision(
      "A107042",
      "软件、集成电路企业优惠情况及明细表",
      inquiry.is_software_ic ? "required" : "skipped",
      inquiry.is_software_ic
        ? "问询为软件/集成电路企业，须填报本表。"
        : "问询非软件/集成电路企业，不选填本表。",
      {
        inquiry_fields: ["is_software_ic"],
        input_tables: [],
        signals: [`is_software_ic=${inquiry.is_software_ic}`],
      },
      "form-selection-logic §4.4"
    )
  );
  forms.push(
    decision(
      "A107050",
      "税额抵免优惠明细表",
      inquiry.has_special_equipment_credit ? "required" : "skipped",
      inquiry.has_special_equipment_credit
        ? "问询有专用设备税额抵免，须填报本表。"
        : "问询无专用设备税额抵免，不选填本表。",
      {
        inquiry_fields: ["has_special_equipment_credit"],
        input_tables: [],
        signals: [
          `has_special_equipment_credit=${inquiry.has_special_equipment_credit}`,
        ],
      },
      "form-selection-logic §4.4"
    )
  );

  // Step 6: A106000 — only needs_loss_schedule
  if (signals.needs_loss_schedule) {
    forms.push(
      decision(
        "A106000",
        "企业所得税弥补亏损明细表",
        "required",
        "存在待弥补亏损、本年亏损或本年弥补额，须填报本表并回写主表第26行。",
        {
          inquiry_fields: ["loss_enterprise_type"],
          input_tables: ["loss_carryforward"],
          signals: ["needs_loss_schedule=true"],
        },
        "form-selection-logic v0.2：仅弥补需求才 required"
      )
    );
  } else {
    forms.push(
      decision(
        "A106000",
        "企业所得税弥补亏损明细表",
        "skipped",
        "无实际弥补/结转需求（即使 loss_carryforward 文件存在且仅有本年盈利0亏损行），不选填本表。",
        {
          inquiry_fields: ["loss_enterprise_type"],
          input_tables: ["loss_carryforward"],
          signals: ["needs_loss_schedule=false"],
        },
        "form-selection-logic v0.2：仅有台账文件不够"
      )
    );
  }

  // Step 8: v1 out of scope
  const v1Skip: Array<[string, string, string]> = [
    ["A101020", "金融企业收入明细表", "v1锁定一般企业画像，金融表一律不填。"],
    ["A102020", "金融企业支出明细表", "v1锁定一般企业画像，金融表一律不填。"],
    [
      "A103000",
      "事业单位、民间非营利组织收入、支出明细表",
      "v1锁定一般企业画像，事业民间表一律不填。",
    ],
    [
      "A105100",
      "企业重组及递延纳税事项纳税调整明细表",
      "v1不做重组细节，默认不选填。",
    ],
    ["A105110", "政策性搬迁纳税调整明细表", "v1不做政策性搬迁细节，默认不选填。"],
    [
      "A105120",
      "特殊行业准备金及纳税调整明细表",
      "v1不做特殊行业准备金，默认不选填。",
    ],
    [
      "A108000",
      "境外所得税收抵免明细表",
      "v1锁定 has_overseas_income=false，境外抵免表不填。",
    ],
    [
      "A108010",
      "境外所得纳税调整后所得明细表",
      "v1锁定无境外所得，不填。",
    ],
    [
      "A108020",
      "境外分支机构弥补亏损明细表",
      "v1锁定无境外所得，不填。",
    ],
    [
      "A108030",
      "跨年度结转抵免境外所得税明细表",
      "v1锁定无境外所得，不填。",
    ],
    [
      "A109000",
      "跨地区经营汇总纳税企业年度分摊企业所得税明细表",
      "v1锁定 is_cross_region=false，汇总纳税分摊表不填。",
    ],
    [
      "A109010",
      "企业所得税汇总纳税分支机构所得税分配表",
      "v1锁定非跨地区，不填。",
    ],
  ];
  for (const [code, name, reason] of v1Skip) {
    forms.push(
      decision(
        code,
        name,
        "skipped",
        reason,
        {
          inquiry_fields: ["is_cross_region", "has_overseas_income", "is_general_enterprise"],
          input_tables: [],
          signals: [
            `is_cross_region=${inquiry.is_cross_region}`,
            `has_overseas_income=${inquiry.has_overseas_income}`,
          ],
        },
        "cit-mcp-plan / form-selection-logic §4.5"
      )
    );
  }

  // Hard-assert: small micro must not put detail triplet on checklist
  if (inquiry.is_small_micro) {
    for (const code of ["A101010", "A102010", "A104000"]) {
      const f = forms.find((x) => x.form_code === code);
      if (f && (f.status === "required" || f.status === "optional_filled")) {
        f.status = "skipped";
        f.reason =
          "小型微利企业硬约束：A101010/A102010/A104000 禁止 required/optional_filled，已强制改为 skipped。";
      }
    }
  }

  const checklist_for_cover = forms
    .filter((f) => f.status === "required" || f.status === "optional_filled")
    .map((f) => f.form_code);

  const summary = {
    required: forms.filter((f) => f.status === "required").length,
    skipped: forms.filter((f) => f.status === "skipped").length,
    optional_filled: forms.filter((f) => f.status === "optional_filled").length,
    pending_data: forms.filter((f) => f.status === "pending_data").length,
  };

  return {
    schema_version: "0.1",
    tax_year: inquiry.tax_year,
    taxpayer_id: taxpayerId,
    profile: {
      is_general_enterprise: !!inquiry.is_general_enterprise,
      is_small_micro: !!inquiry.is_small_micro,
      is_cross_region: !!inquiry.is_cross_region,
      has_overseas_income: !!inquiry.has_overseas_income,
    },
    pipeline_step: "select_forms",
    blocked: false,
    block_reason: null,
    ready_for_fill: summary.pending_data === 0,
    forms,
    checklist_for_cover,
    summary,
  };
}
