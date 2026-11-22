import type {
  FillReturnResult,
  FormSelectionResult,
  FilledFormStub,
} from "./types.js";

/**
 * Stub fill: only skeleton rows for required / optional_filled forms.
 * Does NOT claim complete line-level correctness.
 */
export function fillReturnStub(
  selection: FormSelectionResult
): FillReturnResult {
  if (selection.blocked) {
    return {
      schema_version: "0.1",
      pipeline_step: "fill_return",
      note: "选表已阻断，未生成填表骨架。",
      forms: [],
    };
  }

  const targets = selection.forms.filter(
    (f) => f.status === "required" || f.status === "optional_filled"
  );

  const forms: FilledFormStub[] = targets.map((f) => ({
    form_code: f.form_code,
    form_name: f.form_name,
    status: f.status,
    note: "占位骨架：未计算完整行次；仅表明该表将进入填报。",
    rows: [
      {
        row: "meta.tax_year",
        label: "所属期年度",
        value: selection.tax_year,
      },
      {
        row: "meta.status",
        label: "选表状态",
        value: f.status,
      },
      {
        row: "placeholder",
        label: "行次明细",
        value: null,
      },
    ],
  }));

  return {
    schema_version: "0.1",
    pipeline_step: "fill_return",
    note: "v1 stub：仅对 required/optional_filled 返回骨架，不声称已完整填好所有行次。",
    forms,
  };
}
