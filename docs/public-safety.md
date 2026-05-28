# Public Safety

Public safety is a first-class gate in this repository. The samples should explain the workflow design without exposing real people, organizations, systems, or operational data.

## Excluded Content

Do not include:

- Personal information.
- Real customer names.
- Internal organization names.
- Internal project names.
- Email addresses.
- API keys.
- token values.
- password values.
- credential values.
- client_secret values.
- private keys.
- Real logs.
- Local-only paths.
- Text copied from non-public repositories or documents.

## Safety Gate

The safety gate has two parts.

- Mechanical scan: `npm run scan`
- Human context review: inspect each hit and decide whether it is checklist text or unsafe content.

Mechanical scanning is intentionally conservative. It should create review work rather than silently miss risky language.

## Allowlisted Hits

Some risky terms are expected in safety docs and review checklists. These are allowed only as policy language. Examples include the search pattern itself and lists of excluded content.

Allowed hits must not contain real values.

## Public Sample Rules

- Use synthetic IDs and timestamps.
- Use generic component names such as `demo-service` or `sample-docs`.
- Do not include realistic log lines.
- Avoid local machine paths.
- Describe operational patterns, not internal procedures.
- Replace uncertain details with a review TODO instead of publishing them.

## Pre-Publish Checklist

1. Run `npm run smoke`.
2. Inspect all output from `npm run scan`.
3. Confirm that remaining risky terms are checklist or policy terms.
4. Confirm that examples are synthetic.
5. Confirm that the README does not overclaim production readiness.
6. Confirm that `TODO_public_review.md` has no unresolved blocker.

## Decision Rule

When a detail is ambiguous, remove it from public files and record the question in `TODO_public_review.md`.
