# ADR 0003: Policy-Based Review Gate

## Background

Public-safety and quality review need explicit criteria rather than hidden reviewer memory.

## Decision

Use documented prompts, schemas, risk policy, and quality gate output to make review decisions traceable.

## Reason

Policy-based review makes failures actionable and lets another operator understand why a result passed, needs review, or is blocked.

## Impact

The quality gate is conservative. `needs_review` is an expected state for negative or high-risk cases and still requires human judgment.
