# Codex Task Prompt Template

engineering workをboundedで検証可能なtaskに変換するためのtemplateです。目的は、別のreviewerがscope、evidence、riskを確認できる程度にexecutionを再現可能にすることです。

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

- taskは検証できる狭さにする。
- read scopeを明示する。
- verificationは可能な限りmechanicalにする。
- executorはskipped checkを隠さず報告する。
- public-facing workではsafety constraintsを見える状態に保つ。

## Anti-Patterns

- 理由なく広範なrepo explorationを依頼する。
- review gateなしでgenerated textを受け入れる。
- scriptのpassをcontent qualityの証明として扱う。
- reportをきれいに見せるためにuncertaintyを隠す。
