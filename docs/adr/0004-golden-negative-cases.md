# ADR 0004: Golden And Negative Cases

## Background

Positive examples alone do not show how the workflow handles unsafe or incomplete requests.

## Decision

Keep both golden cases and negative cases under `examples/golden_cases/`.

## Reason

The same evaluator can verify useful paths and expected rejection or revision paths.

## Impact

Negative cases are expected to produce review-required outcomes. They are synthetic and must not include real operational data.
