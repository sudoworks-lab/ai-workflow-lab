# Evaluation

Evaluation in this repository is workflow evaluation, not model benchmarking. The question is whether the process produces reviewable, safe, and verifiable work with enough evidence to decide whether to pass, revise, or reject.

## Evaluation Assets

The current golden cases cover three operating modes:

- Development support: `examples/golden_cases/roblox_game_dev.json`
- Log collection planning: `examples/golden_cases/log_auto_collect.json`
- Documentation maintenance: `examples/golden_cases/docs_maintenance.json`

The negative cases cover expected rejection or revision paths:

- Overbroad agent access: `examples/golden_cases/negative_overbroad_codex_access.json`
- Unsafe log collection: `examples/golden_cases/negative_sensitive_log_collection.json`
- Unreviewed docs publication: `examples/golden_cases/negative_unreviewed_docs_publish.json`

Each case includes:

- `task`: what the workflow is supposed to do.
- `input`: synthetic task input and source boundaries.
- `expected_output`: required artifacts and acceptance criteria.
- `checks`: mechanical and human checks.
- `risk`: likely failure modes and safety controls.
- `review_points`: what a reviewer should inspect.

## What Good Looks Like

A good workflow result should:

- Stay within the stated scope.
- Produce the expected artifacts.
- Record evidence in a run receipt.
- Pass schema validation.
- Identify unverified assumptions.
- Avoid unsafe public details.
- Produce actionable follow-up when incomplete.

## Mechanical Validation

`src/validate_json.ts` supports a small subset of JSON Schema:

- `type`
- `required`
- `properties`
- `items`

The script validates the sample run receipt and all golden cases. It also prints a summary that separates checked files from failures.

Review results are validated with `schemas/review_result.schema.json` so human review decisions can be checked for minimum structure.

## Eval Runner

Run local evaluation:

```bash
npm run eval
```

`src/eval_runner.ts` reads `examples/golden_cases/*.json`, separates positive and negative cases, checks whether each case has workflow checks, risk controls, review points, and acceptance criteria, and returns:

- `pass`: structurally complete case with low or medium risk.
- `needs_review`: negative case or high-risk case that should be reviewed by a human.
- `fail`: case missing required evaluation substance.

The output shape is defined by `schemas/eval_result.schema.json`, and `examples/eval_results/sample_eval_result.json` provides a public-safe sample.

## Risk Score

`src/risk_score.ts` uses `config/risk_policy.json` to score:

- Dangerous terms.
- Overbroad access.
- Real-log-like collection requests.
- Review gate bypass.
- Public release risk.

The score maps to `low`, `medium`, `high`, or `blocked`. It is deterministic and local; it does not call external APIs.

## Reports

Run:

```bash
npm run report
```

The report generator combines validation, public-safety scan, evaluation, and workflow summary into `reports/latest.md`.

## Regression

Run:

```bash
npm run regression
```

`src/regression_check.ts` compares the current eval result against `baselines/eval_baseline.json`. It watches pass, needs-review, fail, blocked-risk, and high-risk counts. Worsening counts produce `needs_review` or `blocked`.

## Quality Gate

Run:

```bash
npm run gate
```

`src/quality_gate.ts` combines validation, safety scan, eval, regression, risk scoring, and review result status into one publication-readiness result:

- `pass`: ready to proceed to final public review.
- `needs_review`: mechanically usable but human review is still required.
- `blocked`: must be fixed before publication review.

Generated execution evidence is written under `artifacts/latest/`.

## Human Evaluation

Mechanical validation is not enough. Reviewers should still inspect:

- Whether the task is realistic and bounded.
- Whether the expected output is useful.
- Whether checks are strong enough to catch failure.
- Whether risk controls are concrete.
- Whether public-safety language is only checklist language.

## Regression Use

When prompts or schemas change, run:

```bash
npm run smoke
npm run regression
npm run gate
npm run test
```

If a golden case fails, decide whether the case or the schema should change. Do not weaken the schema only to make the test pass.
