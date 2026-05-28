import * as fs from "node:fs";
import * as path from "node:path";
import { writeJsonArtifact } from "./artifacts";
import { RiskLevel, loadRiskPolicy, scoreObject } from "./risk_score";

type EvalStatus = "pass" | "needs_review" | "fail";

type GoldenCase = {
  case_id: string;
  use_case: string;
  task: {
    goal: string;
    scope: string[];
    non_goals: string[];
  };
  input: {
    source_type: string;
    summary: string;
    constraints: string[];
  };
  expected_output: {
    artifacts: string[];
    acceptance_criteria: string[];
  };
  checks: Array<{
    name: string;
    method: string;
    expected_result: string;
  }>;
  risk: {
    level: RiskLevel;
    failure_modes: string[];
    mitigations: string[];
  };
  review_points: string[];
  improvement_signals: string[];
};

export type EvalCaseResult = {
  case_id: string;
  case_type: "positive" | "negative";
  status: EvalStatus;
  risk_level: RiskLevel;
  risk_score: number;
  check_count: number;
  review_point_count: number;
  findings: string[];
};

export type EvalResult = {
  eval_id: string;
  generated_at: string;
  status: EvalStatus;
  summary: string;
  totals: {
    cases: number;
    positive: number;
    negative: number;
    pass: number;
    needs_review: number;
    fail: number;
  };
  case_results: EvalCaseResult[];
};

const ROOT = process.cwd();

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(ROOT, filePath), "utf8")) as T;
}

function listCaseFiles(examplesDir = "examples/golden_cases"): string[] {
  const absoluteDir = path.join(ROOT, examplesDir);
  if (!fs.existsSync(absoluteDir)) {
    return [];
  }

  return fs
    .readdirSync(absoluteDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => path.join(examplesDir, entry.name))
    .sort();
}

function caseType(item: GoldenCase): "positive" | "negative" {
  return item.case_id.startsWith("negative-") || item.use_case.toLowerCase().includes("negative")
    ? "negative"
    : "positive";
}

function hasRequiredShape(item: GoldenCase): boolean {
  return (
    item.checks.length > 0 &&
    item.review_points.length > 0 &&
    item.risk.failure_modes.length > 0 &&
    item.risk.mitigations.length > 0 &&
    item.expected_output.acceptance_criteria.length > 0
  );
}

function evaluateCase(item: GoldenCase): EvalCaseResult {
  const type = caseType(item);
  const riskResult = scoreObject(item, loadRiskPolicy());
  const findings: string[] = [];

  if (!hasRequiredShape(item)) {
    findings.push("case is missing checks, review points, risk controls, or acceptance criteria");
  }

  if (type === "negative") {
    const expectedGateLanguage = item.expected_output.acceptance_criteria.some((criterion) => {
      const lower = criterion.toLowerCase();
      return lower.includes("reject") || lower.includes("revise") || lower.includes("blocked");
    });
    if (!expectedGateLanguage) {
      findings.push("negative case does not require reject, revise, or blocked behavior");
    }
  }

  if (type === "positive" && (riskResult.level === "blocked" || riskResult.level === "high")) {
    findings.push("positive case has high or blocked risk score");
  }

  let status: EvalStatus = "pass";
  if (!hasRequiredShape(item) || (type === "negative" && findings.length > 0)) {
    status = "fail";
  } else if (riskResult.level === "blocked" || riskResult.level === "high" || type === "negative") {
    status = "needs_review";
  }

  return {
    case_id: item.case_id,
    case_type: type,
    status,
    risk_level: riskResult.level,
    risk_score: riskResult.score,
    check_count: item.checks.length,
    review_point_count: item.review_points.length,
    findings: findings.length > 0 ? findings : ["case has required workflow evaluation fields"],
  };
}

function overallStatus(caseResults: EvalCaseResult[]): EvalStatus {
  if (caseResults.some((item) => item.status === "fail")) {
    return "fail";
  }
  if (caseResults.some((item) => item.status === "needs_review")) {
    return "needs_review";
  }
  return "pass";
}

export function runEvaluation(generatedAt = new Date().toISOString()): EvalResult {
  const cases = listCaseFiles().map((file) => readJson<GoldenCase>(file));
  const caseResults = cases.map(evaluateCase);
  const totals = {
    cases: caseResults.length,
    positive: caseResults.filter((item) => item.case_type === "positive").length,
    negative: caseResults.filter((item) => item.case_type === "negative").length,
    pass: caseResults.filter((item) => item.status === "pass").length,
    needs_review: caseResults.filter((item) => item.status === "needs_review").length,
    fail: caseResults.filter((item) => item.status === "fail").length,
  };
  const status = overallStatus(caseResults);

  return {
    eval_id: `eval-${generatedAt.slice(0, 10)}`,
    generated_at: generatedAt,
    status,
    summary: `Evaluated ${totals.cases} case(s): ${totals.positive} positive, ${totals.negative} negative.`,
    totals,
    case_results: caseResults,
  };
}

export function printEvalResult(result: EvalResult): void {
  console.log(JSON.stringify(result, null, 2));
}

export function main(): number {
  const result = runEvaluation();
  const artifactPath = writeJsonArtifact("eval_result.json", result);
  printEvalResult(result);
  console.log(`artifact: ${artifactPath}`);
  return result.status === "fail" ? 1 : 0;
}

if (require.main === module) {
  process.exitCode = main();
}
