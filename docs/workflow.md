# Workflow

The workflow is a short improvement loop around AI-assisted execution.

## 1. Define The Task

Use `prompts/codex_task.md` to state:

- Objective.
- Scope.
- Allowed reading.
- Required implementation.
- Verification commands.
- Safety constraints.
- Reporting format.

Good tasks are bounded enough that a reviewer can decide whether the work passed.

## 2. Execute With Constraints

The executor performs only the requested work. If more context is needed, the executor records why instead of silently expanding scope.

Execution can be manual, AI-assisted, or script-driven. The workflow cares about traceability, not which tool produced the first draft.

## 3. Capture A Run Receipt

The run receipt records:

- Task and input reference.
- Expected output.
- Artifacts changed.
- Checks performed.
- Risks found.
- Review points.
- Follow-up actions.

This turns a chat result into evidence that can be reviewed later.

## 4. Validate Structured Records

Run:

```bash
npm run validate
```

Validation catches missing fields and wrong basic types in golden cases and run receipts. It is a mechanical gate, not a quality judgment.

## 5. Review Output Quality

Use `prompts/review_gate.md` to decide:

- `pass`: acceptable for the stated scope.
- `revise`: useful but incomplete.
- `reject`: unsafe, unverifiable, or out of scope.

Review should cite evidence from artifacts, checks, and the receipt.

When review output should be recorded, write a file under `examples/review_results/` that follows `schemas/review_result.schema.json`.

## 6. Run Safety Review

Run:

```bash
npm run scan
```

The safety gate searches for risky terms. Checklist and policy hits are allowed only after manual context review. Real values should be removed.

## 7. Feed Back Improvements

If the work failed, update one or more of:

- Task prompt.
- Review gate prompt.
- Handoff prompt.
- Schema.
- Golden case.
- Operations doc.
- TODO public review list.

The loop is useful only if failures change the system, not just the current output.

## Templates

Reusable placeholders live under `templates/`. They are intentionally generic and should be copied into `examples/` only after replacing placeholder text with synthetic, public-safe values.
