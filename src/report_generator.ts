import * as fs from "node:fs";
import * as path from "node:path";
import { runEvaluation } from "./eval_runner";
import { scanPublicFiles } from "./public_safety_scan";
import { runQualityGate } from "./quality_gate";
import { runRegressionCheck } from "./regression_check";
import { buildWorkflowSummary } from "./workflow_summary";
import { validateAll } from "./validate_json";

const ROOT = process.cwd();
const REPORT_PATH = "reports/latest.md";

function lineItems(items: string[]): string[] {
  return items.length > 0 ? items.map((item) => `- ${item}`) : ["- none"];
}

export function buildMarkdownReport(generatedAt = new Date().toISOString()): string {
  const validationResults = validateAll();
  const safetyHits = scanPublicFiles();
  const evalResult = runEvaluation(generatedAt);
  const regressionResult = runRegressionCheck("baselines/eval_baseline.json", generatedAt, evalResult);
  const gateResult = runQualityGate(generatedAt);
  const summary = buildWorkflowSummary();
  const validationFailures = validationResults.filter((item) => item.status === "FAIL");
  const disallowedSafetyHits = safetyHits.filter((item) => !item.allowed);

  return [
    "# AI Workflow Lab Report",
    "",
    `Generated at: ${generatedAt}`,
    "",
    "## Status",
    "",
    `- Validation: ${validationFailures.length === 0 ? "pass" : "fail"}`,
    `- Public safety scan: ${disallowedSafetyHits.length === 0 ? "pass" : "fail"}`,
    `- Evaluation: ${evalResult.status}`,
    `- Regression: ${regressionResult.status}`,
    `- Quality gate: ${gateResult.status}`,
    "",
    "## Validation",
    "",
    `- Targets: ${validationResults.length}`,
    `- Passed: ${validationResults.filter((item) => item.status === "PASS").length}`,
    `- Failed: ${validationFailures.length}`,
    "",
    "## Public Safety Scan",
    "",
    `- Hits requiring manual context review: ${safetyHits.length}`,
    `- Disallowed hits: ${disallowedSafetyHits.length}`,
    "",
    "## Evaluation",
    "",
    `- Cases: ${evalResult.totals.cases}`,
    `- Positive cases: ${evalResult.totals.positive}`,
    `- Negative cases: ${evalResult.totals.negative}`,
    `- Pass: ${evalResult.totals.pass}`,
    `- Needs review: ${evalResult.totals.needs_review}`,
    `- Fail: ${evalResult.totals.fail}`,
    "",
    "### Case Results",
    "",
    ...lineItems(
      evalResult.case_results.map(
        (item) =>
          `${item.case_id}: ${item.status}, risk=${item.risk_level}, score=${item.risk_score}`,
      ),
    ),
    "",
    "## Regression",
    "",
    `- Baseline: ${regressionResult.baseline_ref}`,
    `- Status: ${regressionResult.status}`,
    `- Delta passed: ${regressionResult.delta.passed}`,
    `- Delta needs review: ${regressionResult.delta.needs_review}`,
    `- Delta failed: ${regressionResult.delta.failed}`,
    `- Delta blocked: ${regressionResult.delta.blocked}`,
    `- Delta high risk: ${regressionResult.delta.risk_high}`,
    "",
    "## Quality Gate",
    "",
    `- Status: ${gateResult.status}`,
    ...lineItems(gateResult.reasons),
    "",
    "## Workflow Summary",
    "",
    "```text",
    summary,
    "```",
    "",
    "## Review Notes",
    "",
    "- This report is generated from synthetic examples and local checks only.",
    "- Manual public review is still required before publication.",
  ].join("\n");
}

export function writeReport(reportPath = REPORT_PATH): string {
  const outputPath = path.join(ROOT, reportPath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, buildMarkdownReport(), "utf8");
  return reportPath;
}

export function main(): number {
  const reportPath = writeReport();
  console.log(`Report written: ${reportPath}`);
  return 0;
}

if (require.main === module) {
  process.exitCode = main();
}
