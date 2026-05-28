# Operations

Operate this repository from its root directory.

## Standard Pre-Review Check

```bash
npm install
npm run smoke
```

The smoke test performs:

- Required file existence checks.
- JSON parsing checks.
- Simplified schema validation.
- Public-safety term scan.
- Evaluation runner check.
- Regression baseline check.
- Quality gate check.
- Markdown report generation.
- Node test suite execution.
- Workflow summary generation.

## Individual Checks

Run JSON validation only:

```bash
npm run validate
```

Run public-safety scan only:

```bash
npm run scan
```

Generate the portfolio workflow summary:

```bash
npm run summary
```

Run evaluation:

```bash
npm run eval
```

Run regression against the baseline:

```bash
npm run regression
```

Run the publication quality gate:

```bash
npm run gate
```

Generate the Markdown report:

```bash
npm run report
```

Run tests:

```bash
npm run test
```

Run the same checks through the CLI entrypoint:

```bash
npm run cli -- validate
npm run cli -- scan
npm run cli -- summary
npm run cli -- eval
npm run cli -- regression
npm run cli -- gate
npm run cli -- report
npm run cli -- run-all
npm run cli -- smoke
```

## Adding A Golden Case

1. Create a JSON file under `examples/golden_cases/`.
2. Follow `schemas/golden_case.schema.json`.
3. Include task, input, expected output, checks, risk, and review points.
4. Run `npm run validate`; files under `examples/golden_cases/` are discovered automatically.
5. Run `npm run smoke`.
6. Record unclear public-review decisions in `TODO_public_review.md`.

## Adding A Run Receipt

1. Create a JSON file under `examples/run_receipts/`.
2. Follow `schemas/run_receipt.schema.json`.
3. Keep all values synthetic for public samples.
4. Include commands that were actually run.
5. Include skipped checks and residual risks.
6. Run `npm run smoke`.

## Adding A Review Result

1. Create a JSON file under `examples/review_results/`.
2. Follow `schemas/review_result.schema.json`.
3. Record status, evidence, findings, required changes, and next action.
4. Keep the result tied to synthetic examples or public-safe artifacts.
5. Run `npm run validate` and `npm run smoke`.

## Updating Risk Policy

1. Edit `config/risk_policy.json`.
2. Keep terms generic and policy-oriented.
3. Follow `schemas/risk_policy.schema.json`.
4. Run `npm run eval` to inspect scoring impact.
5. Run `npm run test` and `npm run smoke`.

## Report Operation

`npm run report` writes `reports/latest.md`. Treat the report as generated review evidence. It summarizes local checks and does not replace human public review.

## Artifact Operation

The eval, regression, gate, and summary commands write latest execution evidence under `artifacts/latest/`:

- `eval_result.json`
- `regression_result.json`
- `quality_gate_result.json`
- `summary.md`

These files are generated evidence. Review them before publication.

## Updating The Baseline

Update `baselines/eval_baseline.json` only after a human accepts the new eval behavior. Run `npm run regression` before and after the update to confirm the intended delta.

## ADRs

Design decisions live under `docs/adr/`. Add a short ADR when changing implementation language, external dependency boundaries, review policy, case strategy, or gate behavior.

## Using Templates

Use files under `templates/` as starting points only. Replace placeholder text with synthetic, public-safe values before moving a file into `examples/`.

## Failure Handling

If validation fails:

- Fix missing fields or wrong types first.
- Decide whether the schema or sample is incorrect.
- Keep failures visible until a real correction is made.
- Do not downgrade required fields only to pass.

If public-safety scan reports hits:

- Check whether each hit is policy/checklist text or a real value.
- Keep policy/checklist hits only when they are necessary.
- Remove real values and replace them with generic placeholders.
- Add unresolved decisions to `TODO_public_review.md`.

## Operating Boundary

This repository is a public sample. It should not be treated as a production automation system until storage, access control, audit retention, and execution isolation are designed separately.

## Implementation Boundary

Repository checks and summaries are implemented in TypeScript under `src/` and exposed through npm scripts. Shell files are retained only as thin compatibility launchers that call `npm run`.
