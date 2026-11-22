import { fillReturnStub } from "./fill-return.js";
import { selectForms } from "./select-forms.js";
import {
  getState,
  ingestBooks,
  setFill,
  setInquiryAnswers,
  setSelection,
} from "./store.js";
import type { BooksPayload, InquiryAnswers } from "./types.js";

export function toolIngestBooks(args: {
  books: BooksPayload;
  taxpayer_id?: string | null;
}) {
  const books = { ...args.books };
  if (args.taxpayer_id !== undefined) {
    books.taxpayer_id = args.taxpayer_id;
  }
  const stored = ingestBooks(books);
  const tables = [
    "trial_balance",
    "income_statement",
    "asset_register",
    "payroll_breakdown",
    "loss_carryforward",
    "prepaid_cit",
    "rd_aux_ledger",
    "donation_list",
  ] as const;
  const counts: Record<string, number> = {};
  for (const t of tables) {
    counts[t] = Array.isArray(stored[t]) ? (stored[t] as unknown[]).length : 0;
  }
  return {
    ok: true,
    message: "已接收账簿/台账结构化数据（内存会话）。",
    taxpayer_id: stored.taxpayer_id ?? null,
    tax_year: stored.tax_year ?? null,
    table_row_counts: counts,
  };
}

export function toolSetInquiryAnswers(args: { answers: InquiryAnswers }) {
  const stored = setInquiryAnswers(args.answers);
  return {
    ok: true,
    message: "已写入问询答案（内存会话）。",
    tax_year: stored.tax_year,
    is_small_micro: stored.is_small_micro,
    claim_rd_super_deduction: stored.claim_rd_super_deduction,
    has_public_welfare_donation: stored.has_public_welfare_donation,
    is_hnte: stored.is_hnte,
  };
}

/** Stub for ask_gaps — returns missing required inquiry fields if any. */
export function toolAskGapsStub() {
  const { books, inquiry } = getState();
  const gaps: string[] = [];
  if (!books) gaps.push("尚未 ingest_books");
  if (!inquiry) {
    gaps.push("尚未 set_inquiry_answers");
  } else {
    const required = [
      "tax_year",
      "declaration_type",
      "is_cross_region",
      "has_overseas_income",
      "is_general_enterprise",
      "is_small_micro",
      "claim_rd_super_deduction",
      "has_public_welfare_donation",
      "is_hnte",
    ] as const;
    for (const k of required) {
      if (inquiry[k] === undefined || inquiry[k] === null) {
        gaps.push(`inquiry_answers 缺字段: ${k}`);
      }
    }
    if (
      inquiry.claim_rd_super_deduction === true &&
      (!inquiry.rd_ledger_style || !inquiry.rd_super_deduction_rate)
    ) {
      gaps.push("享受研发加计时须提供 rd_ledger_style 与 rd_super_deduction_rate");
    }
  }
  return {
    ok: true,
    pipeline_step: "ask_gaps",
    gaps,
    ready: gaps.length === 0,
  };
}

export function toolSelectForms() {
  const { books, inquiry } = getState();
  if (!inquiry) {
    return {
      ok: false,
      error: "请先调用 set_inquiry_answers",
    };
  }
  if (!books) {
    return {
      ok: false,
      error: "请先调用 ingest_books",
    };
  }
  const result = selectForms(inquiry, books, books.taxpayer_id ?? null);
  setSelection(result);
  return { ok: true, result };
}

export function toolFillReturn() {
  const { selection } = getState();
  if (!selection) {
    return {
      ok: false,
      error: "请先调用 select_forms 产出 form_selection_result",
    };
  }
  const fill = fillReturnStub(selection);
  setFill(fill);
  return { ok: true, result: fill };
}

export function toolExportSelection(args?: { format?: "json" }) {
  const { selection } = getState();
  if (!selection) {
    return {
      ok: false,
      error: "尚无选表结果，请先 select_forms",
    };
  }
  return {
    ok: true,
    format: args?.format ?? "json",
    export: selection,
  };
}
