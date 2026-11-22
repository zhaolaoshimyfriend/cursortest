/** Status values for form_selection_result (select_forms v0.2). */
export type FormStatus =
  | "required"
  | "skipped"
  | "optional_filled"
  | "pending_data";

export interface InquiryAnswers {
  tax_year: number;
  declaration_type: string;
  enterprise_type_code: string;
  is_cross_region: boolean;
  has_overseas_income: boolean;
  is_general_enterprise: boolean;
  accounting_standard_code: string;
  report_format_code: string;
  avg_employees: number;
  avg_total_assets: number;
  is_small_micro: boolean;
  industry_code: string;
  is_restricted_industry: boolean;
  is_listed: boolean;
  listing_place?: string | null;
  is_hnte: boolean;
  hnte_certificates?: Array<{ cert_no: string; issue_date: string }>;
  is_tech_sme: boolean;
  tech_sme_records?: Array<{ inbound_no: string; inbound_date: string }>;
  is_software_ic: boolean;
  software_ic_type_code?: string | null;
  claim_rd_super_deduction: boolean;
  rd_ledger_style?: string;
  rd_super_deduction_rate?: string;
  has_accelerated_depreciation: boolean;
  accelerated_policy_names?: string[];
  has_public_welfare_donation: boolean;
  has_tax_exempt_dividends: boolean;
  has_income_exemption: boolean;
  has_special_equipment_credit: boolean;
  has_equity_investment_business: boolean;
  has_overseas_related_party_deal: boolean;
  disability_wage_super_deduction: boolean;
  disability_wage_base?: number | null;
  loss_enterprise_type: string;
  loss_carryforward_source: string;
  shareholders: Array<{
    name: string;
    id_doc_type?: string;
    id_doc_no?: string;
    investment_ratio: number;
    dividends_current_year: number;
    nationality_or_region?: string;
  }>;
  shareholders_changed: boolean;
  has_dividends_this_year: boolean;
  branch_local_tax_ratio?: number | null;
  notes?: string | null;
  [key: string]: unknown;
}

export interface TrialBalanceRow {
  account_code: string;
  account_name: string;
  opening_balance: number;
  debit_amount: number;
  credit_amount: number;
  closing_balance: number;
  account_level?: number;
  is_pl_account?: boolean;
  mapped_fs_line?: string;
}

export interface IncomeStatementRow {
  line_code: string;
  line_name: string;
  amount_current_year: number;
  a100000_row?: number;
}

export interface AssetRegisterRow {
  asset_id: string;
  asset_name: string;
  asset_category: string;
  tax_asset_class: string;
  acquisition_date: string;
  original_cost: number;
  tax_base: number;
  book_depr_current: number;
  tax_depr_current: number;
  is_accelerated: boolean;
}

export interface PayrollBreakdownRow {
  comp_type: string;
  book_amount: number;
  actual_amount: number;
  prior_carryover?: number;
}

export interface LossCarryforwardRow {
  loss_year: number;
  domestic_income: number;
  loss_amount: number;
  already_offset: number;
  remaining_loss: number;
  loss_enterprise_type: string;
  carryforward_years: string | number;
  offset_by_current?: number;
}

export interface PrepaidCitRow {
  period_start: string;
  period_end: string;
  prepaid_tax: number;
  frequency?: string;
}

export interface RdAuxLedgerRow {
  project_id: string;
  project_name: string;
  expense_code: string;
  expense_name: string;
  amount: number;
  costing_type: string;
  eligible_for_super_deduction?: boolean;
}

export interface DonationListRow {
  donation_id: string;
  donee_name: string;
  is_public_welfare: boolean;
  amount: number;
  donation_year: number;
  voucher_type: string;
  is_full_deduction: boolean;
  prior_carryover_deductible?: number;
}

export interface BooksPayload {
  tax_year?: number;
  taxpayer_id?: string | null;
  trial_balance?: TrialBalanceRow[];
  income_statement?: IncomeStatementRow[];
  asset_register?: AssetRegisterRow[];
  payroll_breakdown?: PayrollBreakdownRow[];
  loss_carryforward?: LossCarryforwardRow[];
  prepaid_cit?: PrepaidCitRow[];
  rd_aux_ledger?: RdAuxLedgerRow[];
  donation_list?: DonationListRow[];
}

export interface FormDrivers {
  inquiry_fields: string[];
  input_tables: string[];
  signals: string[];
}

export interface FormDecision {
  form_code: string;
  form_name: string;
  status: FormStatus;
  reason: string;
  drivers: FormDrivers;
  basis: string;
}

export interface FormSelectionResult {
  schema_version: "0.1";
  tax_year: number;
  taxpayer_id: string | null;
  profile: {
    is_general_enterprise: boolean;
    is_small_micro: boolean;
    is_cross_region: boolean;
    has_overseas_income: boolean;
  };
  pipeline_step: "select_forms";
  blocked: boolean;
  block_reason: string | null;
  ready_for_fill: boolean;
  forms: FormDecision[];
  checklist_for_cover: string[];
  summary: {
    required: number;
    skipped: number;
    optional_filled: number;
    pending_data: number;
  };
}

export interface FilledFormStub {
  form_code: string;
  form_name: string;
  status: FormStatus;
  note: string;
  rows: Array<{ row: string; label: string; value: null | number | string }>;
}

export interface FillReturnResult {
  schema_version: "0.1";
  pipeline_step: "fill_return";
  note: string;
  forms: FilledFormStub[];
}

export interface SessionState {
  books: BooksPayload | null;
  inquiry: InquiryAnswers | null;
  selection: FormSelectionResult | null;
  fill: FillReturnResult | null;
}
