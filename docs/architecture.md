# Architecture

This repository models AI-assisted work as a controlled operations loop. The model is intentionally small enough to inspect, but it keeps the same concerns that matter in SRE, Platform Engineering, AIOps, and LLM Ops work.

## System View

```text
operator intent
  -> task prompt
  -> executor
  -> artifacts
  -> run receipt
  -> validation
  -> review gate
  -> safety gate
  -> improvement backlog
```

The executor may be a human, a coding assistant, or a local script. The architecture does not depend on a specific model vendor.

## Components

- `prompts/codex_task.md`: standard task request format.
- `prompts/review_gate.md`: human review checklist for output quality and evidence.
- `prompts/handoff.md`: continuation template for passing work safely.
- `schemas/run_receipt.schema.json`: structure for execution evidence.
- `schemas/golden_case.schema.json`: structure for evaluation cases.
- `schemas/review_result.schema.json`: structure for review decisions.
- `schemas/eval_result.schema.json`: structure for evaluation output.
- `schemas/regression_result.schema.json`: structure for baseline comparison output.
- `schemas/quality_gate_result.schema.json`: structure for publication gate output.
- `schemas/risk_policy.schema.json`: structure for local risk policy.
- `schemas/workflow_config.schema.json`: structure for project workflow configuration.
- `config/risk_policy.json`: local scoring policy for risky workflow signals.
- `workflow.config.json`: enabled checks and path configuration.
- `baselines/eval_baseline.json`: expected eval counts used for regression checks.
- `examples/run_receipts/`: sample execution record.
- `examples/golden_cases/`: representative workflow cases.
- `examples/review_results/`: sample review record.
- `examples/eval_results/`: sample evaluation record.
- `examples/regression_results/`: sample regression record.
- `examples/quality_gate_results/`: sample quality gate record.
- `templates/`: reusable placeholders for new prompts, cases, receipts, and review results.
- `src/validate_json.ts`: simplified local schema validation.
- `src/public_safety_scan.ts`: public-safety term scan with allowlisted documentation hits.
- `src/workflow_summary.ts`: portfolio summary built from examples and receipts.
- `src/eval_runner.ts`: local evaluation runner for positive and negative cases.
- `src/regression_check.ts`: compares current eval output against baseline counts.
- `src/quality_gate.ts`: combines validation, scan, eval, regression, risk, and review status.
- `src/artifacts.ts`: writes latest generated evidence under `artifacts/latest/`.
- `src/risk_score.ts`: local risk scoring engine.
- `src/report_generator.ts`: Markdown report generator.
- `src/smoke_test.ts`: fast repository health check.
- `src/cli.ts`: single local CLI entrypoint for npm script commands.
- `tests/*.test.ts`: node:test coverage for core checks.
- `scripts/*.sh`: thin launchers that call `npm run`.

## Gate Relationship

Review gate and safety gate answer different questions.

- Review gate: Did the work satisfy the task, and is the evidence sufficient?
- Safety gate: Is the output safe to publish or hand off?
- Validation: Does the structured data match the expected shape?
- Evaluation: Do cases have enough checks, risk controls, and review points?
- Regression: Did pass, needs-review, fail, blocked, or high-risk counts worsen against baseline?
- Risk score: Does the case contain signals that require review or blocking?
- Quality gate: Is the current repo state safe enough to move toward public review?
- Smoke test: Do the local checks run from a fresh checkout?

All four are needed because a result can be valid JSON but operationally weak, or operationally useful but not safe to publish.

## Data Model

The MVP uses eight JSON record types.

- Golden case: describes a representative task, input, expected output, checks, risks, and review points.
- Run receipt: records a specific execution, changed artifacts, verification output, risks, and follow-up.
- Review result: records review status, evidence, issues, safety findings, missing verification, required changes, and next action.
- Eval result: records case-level evaluation status, risk level, score, and findings.
- Regression result: records baseline, current, delta, and findings.
- Quality gate result: records combined check status, reasons, and next action.
- Risk policy: records local risk categories, scoring weights, and thresholds.
- Workflow config: records enabled checks and local paths.

The schemas intentionally use a small JSON Schema subset so they can be validated locally with TypeScript.

## Non-Goals

- No production scheduler.
- No model routing layer.
- No external LLM API integration.
- No real log ingestion.
- No persistent database.
- No automatic publishing.

## Platform Interpretation

The repository treats prompts, schemas, examples, TypeScript checks, and receipts as platform primitives. A team could adapt the same pattern to standardize repeated AI-assisted engineering tasks without making every operator invent their own process.

## Implementation Language

Implementation logic is unified in TypeScript. Shell is limited to thin launcher entrypoints, and npm scripts are the supported interface for validation, public-safety scanning, workflow summary generation, and smoke testing. This follows the implementation-language policy for keeping tool bodies out of shell.
