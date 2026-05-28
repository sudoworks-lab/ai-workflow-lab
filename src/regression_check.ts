import * as fs from "node:fs";
import * as path from "node:path";
import { writeJsonArtifact } from "./artifacts";
import { EvalResult, runEvaluation } from "./eval_runner";

type RegressionStatus = "pass" | "needs_review" | "blocked";

type RegressionCounts = {
  passed: number;
  needs_review: number;
  failed: number;
  blocked: number;
  risk_high: number;
};

type Baseline = {
  baseline_id: string;
  generated_at: string;
  counts: RegressionCounts;
  case_results: Array<{
    case_id: string;
    status: string;
    risk_level: string;
    risk_score: number;
  }>;
};

export type RegressionResult = {
  regression_id: string;
  generated_at: string;
  status: RegressionStatus;
  baseline_ref: string;
  current_eval_id: string;
  baseline: RegressionCounts;
  current: RegressionCounts;
  delta: RegressionCounts;
  findings: string[];
};

const ROOT = process.cwd();
const BASELINE_PATH = "baselines/eval_baseline.json";

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(ROOT, filePath), "utf8")) as T;
}

export function countsFromEval(result: EvalResult): RegressionCounts {
  return {
    passed: result.case_results.filter((item) => item.status === "pass").length,
    needs_review: result.case_results.filter((item) => item.status === "needs_review").length,
    failed: result.case_results.filter((item) => item.status === "fail").length,
    blocked: result.case_results.filter((item) => item.risk_level === "blocked").length,
    risk_high: result.case_results.filter((item) => item.risk_level === "high").length,
  };
}

function subtract(current: RegressionCounts, baseline: RegressionCounts): RegressionCounts {
  return {
    passed: current.passed - baseline.passed,
    needs_review: current.needs_review - baseline.needs_review,
    failed: current.failed - baseline.failed,
    blocked: current.blocked - baseline.blocked,
    risk_high: current.risk_high - baseline.risk_high,
  };
}

function classify(delta: RegressionCounts): { status: RegressionStatus; findings: string[] } {
  const findings: string[] = [];

  if (delta.failed > 0) {
    findings.push(`failed cases increased by ${delta.failed}`);
  }
  if (delta.blocked > 0) {
    findings.push(`blocked-risk cases increased by ${delta.blocked}`);
  }
  if (delta.needs_review > 0) {
    findings.push(`needs-review cases increased by ${delta.needs_review}`);
  }
  if (delta.risk_high > 0) {
    findings.push(`high-risk cases increased by ${delta.risk_high}`);
  }
  if (delta.passed < 0) {
    findings.push(`passed cases decreased by ${Math.abs(delta.passed)}`);
  }

  if (delta.failed > 0 || delta.blocked > 0) {
    return { status: "blocked", findings };
  }
  if (findings.length > 0) {
    return { status: "needs_review", findings };
  }
  return { status: "pass", findings: ["current evaluation matches or improves on baseline"] };
}

export function runRegressionCheck(
  baselinePath = BASELINE_PATH,
  generatedAt = new Date().toISOString(),
  evalResult = runEvaluation(generatedAt),
): RegressionResult {
  const baseline = readJson<Baseline>(baselinePath);
  const current = countsFromEval(evalResult);
  const delta = subtract(current, baseline.counts);
  const classification = classify(delta);

  return {
    regression_id: `regression-${generatedAt.slice(0, 10)}`,
    generated_at: generatedAt,
    status: classification.status,
    baseline_ref: baselinePath,
    current_eval_id: evalResult.eval_id,
    baseline: baseline.counts,
    current,
    delta,
    findings: classification.findings,
  };
}

export function main(): number {
  const result = runRegressionCheck();
  const artifactPath = writeJsonArtifact("regression_result.json", result);
  console.log(JSON.stringify(result, null, 2));
  console.log(`artifact: ${artifactPath}`);
  return result.status === "blocked" ? 1 : 0;
}

if (require.main === module) {
  process.exitCode = main();
}
