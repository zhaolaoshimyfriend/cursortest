import type { BooksPayload, InquiryAnswers } from "./types.js";

export interface DerivedSignals {
  has_payroll: boolean;
  has_depr: boolean;
  has_donation: boolean;
  donation_rows: number;
  claims_rd: boolean;
  rd_amount_positive: boolean;
  rd_amount_sum: number;
  needs_loss_schedule: boolean;
  hnte_cert_valid: boolean;
  hnte_cert_missing: boolean;
}

function sumEligibleRd(books: BooksPayload): number {
  const rows = books.rd_aux_ledger ?? [];
  return rows
    .filter((r) => r.eligible_for_super_deduction !== false)
    .reduce((s, r) => s + (Number(r.amount) || 0), 0);
}

/** HNTE certificates are typically valid for 3 years including issue year. */
export function isHnteCertValidInTaxYear(
  certs: Array<{ cert_no: string; issue_date: string }> | undefined,
  taxYear: number
): { valid: boolean; missing: boolean } {
  if (!certs || certs.length === 0) {
    return { valid: false, missing: true };
  }
  for (const c of certs) {
    const issueYear = Number(String(c.issue_date).slice(0, 4));
    if (!Number.isFinite(issueYear)) continue;
    // Valid for issue_year .. issue_year+2 (3 calendar years).
    if (taxYear >= issueYear && taxYear <= issueYear + 2) {
      return { valid: true, missing: false };
    }
  }
  return { valid: false, missing: false };
}

export function deriveSignals(
  inquiry: InquiryAnswers,
  books: BooksPayload
): DerivedSignals {
  const payroll = books.payroll_breakdown ?? [];
  const has_payroll = payroll.some(
    (r) =>
      r.comp_type === "wages" ||
      Number(r.actual_amount) > 0 ||
      Number(r.book_amount) > 0
  );

  const assets = books.asset_register ?? [];
  const has_depr =
    assets.length > 0 &&
    assets.some(
      (r) =>
        Number(r.book_depr_current) > 0 || Number(r.tax_depr_current) > 0
    );

  const donations = books.donation_list ?? [];
  const donation_rows = donations.length;
  const hasCarryoverDonation = donations.some(
    (r) => Number(r.prior_carryover_deductible ?? 0) > 0
  );
  const has_donation =
    donation_rows > 0 ||
    inquiry.has_public_welfare_donation === true ||
    hasCarryoverDonation;

  const claims_rd = inquiry.claim_rd_super_deduction === true;
  const rd_amount_sum = sumEligibleRd(books);
  const rd_amount_positive = rd_amount_sum > 0;

  const losses = books.loss_carryforward ?? [];
  const needs_loss_schedule = losses.some(
    (r) =>
      Number(r.remaining_loss) > 0 ||
      Number(r.loss_amount) > 0 ||
      Number(r.offset_by_current ?? 0) > 0
  );

  const hnte = isHnteCertValidInTaxYear(
    inquiry.hnte_certificates,
    inquiry.tax_year
  );

  return {
    has_payroll,
    has_depr,
    has_donation,
    donation_rows,
    claims_rd,
    rd_amount_positive,
    rd_amount_sum,
    needs_loss_schedule,
    hnte_cert_valid: inquiry.is_hnte === true && hnte.valid,
    hnte_cert_missing: inquiry.is_hnte === true && hnte.missing,
  };
}
