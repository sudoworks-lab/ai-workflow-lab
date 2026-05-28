# Walkthrough

This walkthrough is for someone reviewing the repository before a deeper public review or interview discussion.

## 3 Minutes: Read The Signal

Start with the parts that explain what the repo is:

1. Read the first screen of `README.md`.
2. Look at `docs/images/architecture-overview.svg`.
3. Look at `docs/images/execution-flow.svg`.
4. Open `reports/latest.md` to see the generated review report.
5. Open `artifacts/latest/` to see eval, regression, quality gate, and summary evidence.

The signal to look for is a small TypeScript workflow platform: local checks, eval, risk scoring, baseline comparison, gates, artifacts, reports, and human review.

## 5 Minutes: Run It

Install dependencies and run the end-to-end local path:

```bash
npm install
npm run cli -- run-all
```

Run focused checks when reviewing one layer:

```bash
npm run validate
npm run scan
npm run eval
npm run regression
npm run gate
npm run report
npm run test
npm run smoke
```

Expected result:

- JSON examples and config pass the simplified schema checks.
- Safety scan has no disallowed hits.
- Evaluation passes positive cases and routes negative cases to review.
- Regression matches the accepted baseline.
- Quality gate returns a reviewable publication-readiness status.
- Report and artifact files are generated locally.

## 10 Minutes: Inspect The Design

Use this path to understand the system shape:

1. `docs/architecture.md` for components and gate relationships.
2. `docs/evaluation.md` for eval, risk score, regression, and quality gate behavior.
3. `docs/operations.md` for adding cases, receipts, review results, and baselines.
4. `schemas/*.json` for the record model.
5. `src/cli.ts`, `src/eval_runner.ts`, `src/risk_score.ts`, `src/regression_check.ts`, and `src/quality_gate.ts` for the TypeScript core.
6. `tests/*.test.ts` for local behavior coverage.
7. `docs/adr/` for the design decisions.
8. `.github/workflows/ci.yml` for the CI candidate.

The design intentionally keeps the repo local-first and public-safe. It demonstrates the workflow mechanics rather than depending on a model vendor.

## Before An Interview

Review these files in order:

1. `README.md`
2. `reports/latest.md`
3. `artifacts/latest/quality_gate_result.json`
4. `examples/golden_cases/`
5. `baselines/eval_baseline.json`
6. `docs/adr/0005-regression-and-quality-gate.md`
7. `TODO_public_review.md`
8. `LICENSE_CANDIDATE.md`

Be ready to explain why the quality gate can be `needs_review` while the command succeeds: negative cases and public-review items are expected to require human judgment before release.
