# Handoff Prompt

Use this template when another operator or agent should continue the workflow. A handoff should preserve facts, not recreate the full conversation.

```text
HANDOFF

Objective:

Current state:

Artifacts changed:

Commands already run:

Results:

Known failures or skipped checks:

Risk notes:

Open questions:

Next recommended action:

Do not:
```

## Handoff Rules

- Base the handoff on artifacts, verification output, and run receipts.
- Mark uncertain items as unconfirmed.
- Keep the next action small enough to execute and verify.
- Do not include real logs, restricted values, personal information, or local-only paths.
- Preserve safety concerns instead of cleaning them out of the narrative.

## Minimum Useful Handoff

A useful handoff should answer:

- What was attempted?
- What changed?
- What evidence exists?
- What still needs review?
- What should not be done next?
