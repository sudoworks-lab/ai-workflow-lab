# ADR 0001: Use TypeScript For Tooling

## Background

The repository needs local validation, evaluation, scoring, reporting, and CLI behavior that is more complex than thin shell glue.

## Decision

Implement tool bodies in TypeScript and expose them through npm scripts.

## Reason

TypeScript gives typed structure for JSON records, predictable local execution, and simple reuse across CLI, tests, and reports.

## Impact

Shell remains only as compatibility launchers. New workflow logic should be added under `src/` and covered by `tests/`.
