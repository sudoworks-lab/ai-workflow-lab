# Codex Task Prompt Template

Use this template to turn engineering work into a bounded, verifiable task. The goal is to make execution repeatable enough that another reviewer can inspect scope, evidence, and risk.

```text
STATUS
- Current state:
- Known constraints:
- Prior verification:

WORKDIR
- Repository or working directory:

TASK
- Objective:
- In scope:
- Out of scope:
- Success criteria:

READ
- Allowed files or directories:
- Disallowed files or directories:
- Additional context rule:

IMPLEMENT
- Required changes:
- Required behavior:
- Files expected to change:
- Files that must not change:

VERIFY
- Commands to run:
- Expected passing result:
- What to report if a check cannot run:

RECEIPT
- Record artifacts changed:
- Record checks performed:
- Record risks and skipped checks:

SAFETY
- Data that must not be included:
- Terms that require manual review:
- Publication boundary:

REPORT
- Required sections:
- Evidence to include:
- Open questions to preserve:
```

## Quality Bar

- The task must be narrow enough to verify.
- The read scope should be explicit.
- Verification should be mechanical when possible.
- The executor must report skipped checks instead of implying success.
- Public-facing work must keep safety constraints visible.

## Anti-Patterns

- Asking for broad repo exploration without a reason.
- Accepting generated text without a review gate.
- Treating a passing script as proof that the content is good.
- Hiding uncertainty to make the report look cleaner.
