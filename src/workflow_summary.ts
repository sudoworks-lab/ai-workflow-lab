import * as fs from "node:fs";
import * as path from "node:path";
import { writeTextArtifact } from "./artifacts";

type GoldenCase = {
  case_id: string;
  use_case: string;
  task: {
    goal: string;
    scope: string[];
    non_goals: string[];
  };
  expected_output: {
    artifacts: string[];
    acceptance_criteria: string[];
  };
  risk: {
    level: string;
    failure_modes: string[];
    mitigations: string[];
  };
  review_points: string[];
};

type RunReceipt = {
  run_id: string;
  task_type: string;
  status: string;
  summary: string;
  checks: Array<{ name: string; command: string; result: string; notes: string }>;
  artifacts: Array<{ path: string; kind: string; change_summary: string }>;
  next_actions: string[];
};

type ReviewResult = {
  review_id: string;
  review_status: string;
  summary: string;
  required_changes: string[];
  next_action: string;
};

const ROOT = process.cwd();

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(ROOT, filePath), "utf8")) as T;
}

function listJsonFiles(dirPath: string): string[] {
  const absoluteDir = path.join(ROOT, dirPath);
  if (!fs.existsSync(absoluteDir)) {
    return [];
  }

  return fs
    .readdirSync(absoluteDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => path.join(dirPath, entry.name))
    .sort();
}

function summarizeCases(cases: GoldenCase[]): string[] {
  return cases.map((item) => {
    const artifacts = item.expected_output.artifacts.join(", ");
    const checks = item.review_points.slice(0, 2).join(" / ");
    return `- ${item.use_case}: ${item.task.goal} Artifacts: ${artifacts}. Review focus: ${checks}`;
  });
}

function summarizeReceipts(receipts: RunReceipt[]): string[] {
  return receipts.map((receipt) => {
    const passedChecks = receipt.checks.filter((check) => check.result === "pass").length;
    const artifactPaths = receipt.artifacts.map((artifact) => artifact.path).join(", ");
    return `- ${receipt.run_id}: ${receipt.status} ${receipt.task_type}. Checks passed: ${passedChecks}/${receipt.checks.length}. Artifacts: ${artifactPaths}.`;
  });
}

function summarizeReviewResults(reviewResults: ReviewResult[]): string[] {
  return reviewResults.map((review) => {
    const required = review.required_changes.slice(0, 2).join(" / ");
    return `- ${review.review_id}: ${review.review_status}. ${review.summary} Required: ${required}`;
  });
}

export function buildWorkflowSummary(): string {
  const caseFiles = listJsonFiles("examples/golden_cases");
  const receiptFiles = listJsonFiles("examples/run_receipts");
  const reviewResultFiles = listJsonFiles("examples/review_results");
  const cases = caseFiles.map((file) => readJson<GoldenCase>(file));
  const receipts = receiptFiles.map((file) => readJson<RunReceipt>(file));
  const reviewResults = reviewResultFiles.map((file) => readJson<ReviewResult>(file));

  const riskLevels = new Map<string, number>();
  for (const item of cases) {
    riskLevels.set(item.risk.level, (riskLevels.get(item.risk.level) ?? 0) + 1);
  }

  const commands = new Set<string>();
  for (const receipt of receipts) {
    for (const check of receipt.checks) {
      commands.add(check.command);
    }
  }

  const nextActions = receipts.flatMap((receipt) => receipt.next_actions);

  return [
    "AI Workflow Lab Summary",
    "",
    "What this checks:",
    "- A local, public-safe workflow for bounded AI-assisted engineering work.",
    "- Structured examples, run receipts, validation, safety scanning, and review gates.",
    "- TypeScript npm scripts for repeatable checks without external APIs or real data.",
    "",
    "Golden cases:",
    ...summarizeCases(cases),
    "",
    "Run receipts:",
    ...summarizeReceipts(receipts),
    "",
    "Review results:",
    ...summarizeReviewResults(reviewResults),
    "",
    "Risk profile:",
    ...Array.from(riskLevels.entries())
      .sort()
      .map(([level, count]) => `- ${level}: ${count} case(s)`),
    "",
    "Evidence commands recorded in receipts:",
    ...Array.from(commands)
      .sort()
      .map((command) => `- ${command}`),
    "",
    "Next review actions:",
    ...nextActions.map((action) => `- ${action}`),
    ...reviewResults.map((review) => `- ${review.next_action}`),
  ].join("\n");
}

export function main(): number {
  const summary = buildWorkflowSummary();
  const artifactPath = writeTextArtifact("summary.md", `${summary}\n`);
  console.log(summary);
  console.log(`artifact: ${artifactPath}`);
  return 0;
}

if (require.main === module) {
  process.exitCode = main();
}
