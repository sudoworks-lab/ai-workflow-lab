import * as fs from "node:fs";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { writeJsonArtifact, writeTextArtifact } from "./artifacts";
import { runEvaluation } from "./eval_runner";
import { scanPublicFiles, printSafetyScan } from "./public_safety_scan";
import { runQualityGate } from "./quality_gate";
import { runRegressionCheck } from "./regression_check";
import { writeReport } from "./report_generator";
import { buildWorkflowSummary } from "./workflow_summary";
import { parseAllJsonFiles, printValidationResults, validateAll } from "./validate_json";

const ROOT = process.cwd();

const REQUIRED_FILES = [
  "README.md",
  "package.json",
  "tsconfig.json",
  "docs/architecture.md",
  "docs/workflow.md",
  "docs/evaluation.md",
  "docs/operations.md",
  "docs/public-safety.md",
  "prompts/codex_task.md",
  "prompts/review_gate.md",
  "prompts/handoff.md",
  "schemas/run_receipt.schema.json",
  "schemas/golden_case.schema.json",
  "schemas/review_result.schema.json",
  "schemas/eval_result.schema.json",
  "schemas/regression_result.schema.json",
  "schemas/quality_gate_result.schema.json",
  "schemas/risk_policy.schema.json",
  "schemas/workflow_config.schema.json",
  "config/risk_policy.json",
  "workflow.config.json",
  "examples/golden_cases/roblox_game_dev.json",
  "examples/golden_cases/log_auto_collect.json",
  "examples/golden_cases/docs_maintenance.json",
  "examples/golden_cases/negative_overbroad_codex_access.json",
  "examples/golden_cases/negative_sensitive_log_collection.json",
  "examples/golden_cases/negative_unreviewed_docs_publish.json",
  "examples/run_receipts/sample_receipt.json",
  "examples/review_results/sample_review_result.json",
  "examples/eval_results/sample_eval_result.json",
  "examples/regression_results/sample_regression_result.json",
  "examples/quality_gate_results/sample_quality_gate_result.json",
  "baselines/eval_baseline.json",
  "templates/prompts/codex_task.template.md",
  "templates/golden_cases/golden_case.template.json",
  "templates/run_receipts/run_receipt.template.json",
  "templates/review_results/review_result.template.json",
  "src/validate_json.ts",
  "src/public_safety_scan.ts",
  "src/workflow_summary.ts",
  "src/smoke_test.ts",
  "src/cli.ts",
  "src/eval_runner.ts",
  "src/risk_score.ts",
  "src/regression_check.ts",
  "src/quality_gate.ts",
  "src/report_generator.ts",
  "src/artifacts.ts",
  "tests/validate_json.test.ts",
  "tests/risk_score.test.ts",
  "tests/eval_runner.test.ts",
  "tests/public_safety_scan.test.ts",
  "tests/regression_check.test.ts",
  "tests/quality_gate.test.ts",
  "tests/cli.test.ts",
  "docs/adr/0001-use-typescript-for-tooling.md",
  "docs/adr/0002-no-external-api.md",
  "docs/adr/0003-policy-based-review-gate.md",
  "docs/adr/0004-golden-negative-cases.md",
  "docs/adr/0005-regression-and-quality-gate.md",
  "docs/walkthrough.md",
  ".github/workflows/ci.yml",
  "LICENSE",
  "reports/.gitkeep",
  "artifacts/.gitkeep",
  "artifacts/latest/.gitkeep",
  "scripts/smoke_test.sh",
  "scripts/public_check.sh",
  ".gitignore",
  "TODO_public_review.md",
];

function section(title: string): void {
  console.log("");
  console.log(`== ${title} ==`);
}

function assertRequiredFiles(): void {
  for (const file of REQUIRED_FILES) {
    const exists = fs.existsSync(path.join(ROOT, file));
    if (!exists) {
      throw new Error(`missing required file: ${file}`);
    }
    console.log(`OK ${file}`);
  }
}

function builtTestFiles(): string[] {
  const testDir = path.join(ROOT, "dist/tests");
  if (!fs.existsSync(testDir)) {
    throw new Error("missing built test directory: dist/tests");
  }

  return fs
    .readdirSync(testDir)
    .filter((file) => file.endsWith(".test.js"))
    .map((file) => path.join("dist/tests", file))
    .sort();
}

export function main(): number {
  try {
    section("required files");
    assertRequiredFiles();

    section("json parse");
    for (const file of parseAllJsonFiles()) {
      console.log(`OK ${file}`);
    }

    section("schema validation");
    const validationResults = validateAll();
    printValidationResults(validationResults);
    if (validationResults.some((result) => result.status === "FAIL")) {
      return 1;
    }

    section("public safety scan");
    const safetyHits = scanPublicFiles();
    printSafetyScan(safetyHits);
    if (safetyHits.some((hit) => !hit.allowed)) {
      return 1;
    }

    section("workflow summary");
    const summary = buildWorkflowSummary();
    if (!summary.includes("AI Workflow Lab Portfolio Summary")) {
      throw new Error("workflow summary did not include expected heading");
    }
    writeTextArtifact("summary.md", `${summary}\n`);
    console.log(summary);

    section("evaluation");
    const evalResult = runEvaluation();
    writeJsonArtifact("eval_result.json", evalResult);
    console.log(`status: ${evalResult.status}`);
    console.log(`cases: ${evalResult.totals.cases}`);
    if (evalResult.status === "fail") {
      return 1;
    }

    section("regression");
    const regressionResult = runRegressionCheck("baselines/eval_baseline.json", evalResult.generated_at, evalResult);
    writeJsonArtifact("regression_result.json", regressionResult);
    console.log(`status: ${regressionResult.status}`);
    if (regressionResult.status === "blocked") {
      return 1;
    }

    section("quality gate");
    const gateResult = runQualityGate(evalResult.generated_at);
    writeJsonArtifact("quality_gate_result.json", gateResult);
    console.log(`status: ${gateResult.status}`);
    if (gateResult.status === "blocked") {
      return 1;
    }

    section("report generation");
    const reportPath = writeReport();
    console.log(`OK ${reportPath}`);

    section("test suite");
    const testFiles = builtTestFiles();
    const testResult = spawnSync(`${process.execPath} --test ${testFiles.join(" ")}`, {
      cwd: ROOT,
      encoding: "utf8",
      shell: true,
    });
    if (testResult.stdout) {
      process.stdout.write(testResult.stdout);
    } else {
      console.log(`OK node:test completed for ${testFiles.length} files`);
    }
    if (testResult.stderr) {
      process.stderr.write(testResult.stderr);
    }
    if (testResult.status !== 0) {
      return testResult.status ?? 1;
    }

    console.log("");
    console.log("smoke test passed");
    return 0;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return 1;
  }
}

if (require.main === module) {
  process.exitCode = main();
}
