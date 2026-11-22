import type {
  BooksPayload,
  FillReturnResult,
  FormSelectionResult,
  InquiryAnswers,
  SessionState,
} from "./types.js";

const state: SessionState = {
  books: null,
  inquiry: null,
  selection: null,
  fill: null,
};

export function getState(): SessionState {
  return state;
}

export function ingestBooks(books: BooksPayload): BooksPayload {
  state.books = books;
  state.selection = null;
  state.fill = null;
  return state.books;
}

export function setInquiryAnswers(inquiry: InquiryAnswers): InquiryAnswers {
  state.inquiry = inquiry;
  state.selection = null;
  state.fill = null;
  return state.inquiry;
}

export function setSelection(selection: FormSelectionResult): FormSelectionResult {
  state.selection = selection;
  state.fill = null;
  return state.selection;
}

export function setFill(fill: FillReturnResult): FillReturnResult {
  state.fill = fill;
  return state.fill;
}

export function resetState(): void {
  state.books = null;
  state.inquiry = null;
  state.selection = null;
  state.fill = null;
}
