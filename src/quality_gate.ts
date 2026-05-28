import * as fs from "node:fs";
import * as path from "node:path";
import { writeJsonArtifact } from "./artifacts";
import { runEvaluation } from "./eval_runner";
import { scanPublicFiles } from "./public_safety_scan";
import { runRegressionCheck } from "./regression_check";
import { validateAll } from "./validate_json";

type QualityGateStatus = "pass" | "needs_review" | "blocked";

type ReviewResult = {
  review_id: string;
  review_status: string;
};

export type QualityGateResult = {
  gate_id: string;
  generated_at: string;
  status: QualityGateStatus;
  checks: Array<{
    name: string;
    status: QualityGateStatus;
    detail: string;
  }>;
  reasons: string[];
  next_action: string;
};

const ROOT = process.cwd();

function listReviewResultFiles(): string[] {
  const dirPath = path.join(ROOT, "examples/review_results");
  if (!fs.existsSync(dirPath)) {
    return [];
  }
  return fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => path.join("examples/review_results", entry.name))
    .sort();
}

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(ROOT, filePath), "utf8")) as T;
}

function maxStatus(statuses: QualityGateStatus[]): QualityGateStatus {
  if (statuses.includes("blocked")) return "blocked";
  if (statuses.includes("needs_review")) return "needs_review";
  return "pass";
}

export function runQualityGate(generatedAt = new Date().toISOString()): QualityGateResult {
  const validationResults = validateAll();
  const safetyHits = scanPublicFiles();
  const evalResult = runEvaluation(generatedAt);
  const regressionResult = runRegressionCheck("baselines/eval_baseline.json", generatedAt, evalResult);
  const reviewResults = listReviewResultFiles().map((file) => readJson<ReviewResult>(file));
  const checks: QualityGateResult["checks"] = [];
  const reasons: string[] = [];

  const validationFailures = validationResults.filter((result) => result.status === "FAIL");
  checks.push({
    name: "validate",
    status: validationFailures.length === 0 ? "pass" : "blocked",
    detail: `${validationFailures.length} validation failure(s)`,
  });
  if (validationFailures.length > 0) reasons.push("schema validation failed");

  const disallowedSafetyHits = safetyHits.filter((hit) => !hit.allowed);
  checks.push({
    name: "scan",
    status: disallowedSafetyHits.length === 0 ? "pass" : "blocked",
    detail: `${disallowedSafetyHits.length} disallowed public-safety hit(s)`,
  });
  if (disallowedSafetyHits.length > 0) reasons.push("public-safety scan found disallowed hits");

  checks.push({
    name: "eval",
    status: evalResult.status === "fail" ? "blocked" : evalResult.status === "needs_review" ? "needs_review" : "pass",
    detail: `${evalResult.totals.pass} pass, ${evalResult.totals.needs_review} needs_review, ${evalResult.totals.fail} fail`,
  });
  if (evalResult.status === "needs_review") reasons.push("evaluation includes cases that require review");
  if (evalResult.status === "fail") reasons.push("evaluation failed");

  checks.push({
    name: "regression",
    status: regressionResult.status,
    detail: regressionResult.findings.join("; "),
  });
  if (regressionResult.status !== "pass") reasons.push("regression check detected worsening");

  const blockedRisk = evalResult.case_results.filter((item) => item.risk_level === "blocked").length;
  const highRisk = evalResult.case_results.filter((item) => item.risk_level === "high").length;
  checks.push({
    name: "risk",
    status: blockedRisk > 0 || highRisk > 0 ? "needs_review" : "pass",
    detail: `${blockedRisk} blocked-risk case(s), ${highRisk} high-risk case(s)`,
  });
  if (blockedRisk > 0 || highRisk > 0) reasons.push("risk scoring requires human review");

  const nonPassingReviews = reviewResults.filter((result) => result.review_status !== "pass");
  checks.push({
    name: "review_result",
    status: reviewResults.length === 0 ? "needs_review" : nonPassingReviews.length === 0 ? "pass" : "needs_review",
    detail: `${reviewResults.length} review result(s), ${nonPassingReviews.length} not pass`,
  });
  if (reviewResults.length === 0) reasons.push("no review result is recorded");
  if (nonPassingReviews.length > 0) reasons.push("review result is not pass");

  const status = maxStatus(checks.map((check) => check.status));
  return {
    gate_id: `quality-gate-${generatedAt.slice(0, 10)}`,
    generated_at: generatedAt,
    status,
    checks,
    reasons: reasons.length > 0 ? reasons : ["all quality gate checks passed"],
    next_action:
      status === "blocked"
        ? "Fix blocked checks before publication review."
        : status === "needs_review"
          ? "Complete human review for needs-review checks before publication."
          : "Proceed to final public review.",
  };
}

export function main(): number {
  const result = runQualityGate();
  const artifactPath = writeJsonArtifact("quality_gate_result.json", result);
  console.log(JSON.stringify(result, null, 2));
  console.log(`artifact: ${artifactPath}`);
  return result.status === "blocked" ? 1 : 0;
}

if (require.main === module) {
  process.exitCode = main();
}
