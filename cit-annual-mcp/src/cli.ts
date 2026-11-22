#!/usr/bin/env node
/**
 * Fixture runner — no MCP transport needed.
 * Usage:
 *   npm run fixture -- scenario-a-small-micro
 *   npm run fixture -- scenario-b-non-small-micro
 *   npm run fixture -- --all
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { fillReturnStub } from "./fill-return.js";
import { selectForms } from "./select-forms.js";
import type { BooksPayload, InquiryAnswers } from "./types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesRoot = resolve(__dirname, "../fixtures");

function loadJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function assertScenario(
  name: string,
  selection: ReturnType<typeof selectForms>
): string[] {
  const errors: string[] = [];
  const byCode = Object.fromEntries(
    selection.forms.map((f) => [f.form_code, f])
  );

  const isScenarioA =
    name === "scenario-a-small-micro" || name.startsWith("scenario-a");
  const isScenarioB =
    name === "scenario-b-non-small-micro" || name.startsWith("scenario-b");

  if (isScenarioA) {
    for (const code of ["A101010", "A102010", "A104000"]) {
      if (byCode[code]?.status !== "skipped") {
        errors.push(`${code} 应为 skipped，实际 ${byCode[code]?.status}`);
      }
      if (selection.checklist_for_cover.includes(code)) {
        errors.push(`${code} 不应进入 checklist_for_cover`);
      }
    }
    if (byCode.A107012?.status !== "skipped") {
      errors.push(`A107012 应为 skipped，实际 ${byCode.A107012?.status}`);
    }
    if (byCode.A105070?.status !== "skipped") {
      errors.push(`A105070 应为 skipped，实际 ${byCode.A105070?.status}`);
    }
    if (byCode.A106000?.status !== "skipped") {
      errors.push(`A106000 应为 skipped，实际 ${byCode.A106000?.status}`);
    }
    for (const code of ["A000000", "A100000", "A105050", "A105080", "A105000"]) {
      if (byCode[code]?.status !== "required") {
        errors.push(`${code} 应为 required，实际 ${byCode[code]?.status}`);
      }
    }
  }

  if (isScenarioB) {
    for (const code of ["A101010", "A102010", "A104000"]) {
      if (byCode[code]?.status !== "required") {
        errors.push(`${code} 应为 required，实际 ${byCode[code]?.status}`);
      }
    }
    if (byCode.A107012?.status !== "required") {
      errors.push(`A107012 应为 required，实际 ${byCode.A107012?.status}`);
    }
    if (byCode.A105070?.status !== "required") {
      errors.push(`A105070 应为 required，实际 ${byCode.A105070?.status}`);
    }
    if (byCode.A106000?.status !== "required") {
      errors.push(`A106000 应为 required，实际 ${byCode.A106000?.status}`);
    }
  }

  for (const f of selection.forms) {
    if (!f.reason || !f.reason.trim()) {
      errors.push(`${f.form_code} 缺少中文 reason`);
    }
  }

  return errors;
}

function runOne(scenario: string): boolean {
  const dir = join(fixturesRoot, scenario);
  if (!existsSync(dir)) {
    console.error(`Fixture 不存在: ${dir}`);
    return false;
  }
  const inquiry = loadJson<InquiryAnswers>(join(dir, "inquiry_answers.json"));
  const books = loadJson<BooksPayload>(join(dir, "books.json"));

  console.log(`\n=== ${scenario} ===`);
  const selection = selectForms(inquiry, books, books.taxpayer_id ?? null);
  const fill = fillReturnStub(selection);

  const required = selection.forms
    .filter((f) => f.status === "required")
    .map((f) => f.form_code);
  const skippedKey = selection.forms
    .filter((f) =>
      ["A101010", "A102010", "A104000", "A107012", "A105070", "A106000"].includes(
        f.form_code
      )
    )
    .map((f) => `${f.form_code}=${f.status}`);

  console.log(`tax_year=${selection.tax_year} small_micro=${selection.profile.is_small_micro}`);
  console.log(`summary=`, selection.summary);
  console.log(`checklist=`, selection.checklist_for_cover.join(", "));
  console.log(`key_forms:`, skippedKey.join(", "));
  console.log(`required:`, required.join(", "));
  console.log(`fill stub forms:`, fill.forms.length);

  const errors = assertScenario(scenario, selection);
  if (errors.length) {
    console.error("ASSERT FAIL:");
    for (const e of errors) console.error(" -", e);
    return false;
  }
  console.log("ASSERT OK");
  return true;
}

function main() {
  const arg = process.argv[2];
  let scenarios: string[];
  if (!arg || arg === "--all") {
    scenarios = readdirSync(fixturesRoot).filter((d) =>
      existsSync(join(fixturesRoot, d, "inquiry_answers.json"))
    );
  } else {
    scenarios = [arg];
  }

  let ok = true;
  for (const s of scenarios) {
    if (!runOne(s)) ok = false;
  }
  process.exit(ok ? 0 : 1);
}

main();
