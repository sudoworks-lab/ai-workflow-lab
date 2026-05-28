# ADR 0005: Regression And Quality Gate

## Background

Evaluation output is useful only if changes can be compared against a baseline and summarized as a release decision.

## Decision

Add regression checks against `baselines/eval_baseline.json` and a quality gate that combines validation, scan, eval, regression, risk, and review results.

## Reason

Baseline comparison catches worsening behavior, while the quality gate gives one reviewable publication status.

## Impact

The gate can return `needs_review` even when commands pass. A `blocked` result should stop publication work until fixed.
