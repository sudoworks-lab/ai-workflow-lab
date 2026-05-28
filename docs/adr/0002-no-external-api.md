# ADR 0002: No External API

## Background

This repository is a public-safe workflow sample and must not depend on hidden services or operational data.

## Decision

All checks, evaluation, risk scoring, and reports run locally without external API calls.

## Reason

Local-only execution keeps the sample reproducible, inspectable, and safe to run before publication.

## Impact

The repository demonstrates workflow mechanics, not model quality. Any future external integration must be added outside the default public sample path.
