# Handoff Prompt

別のoperatorやagentがworkflowを継続する場合に使うtemplateです。handoffは会話全体を再現するものではなく、事実を保持するためのものです。

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

- artifacts、verification output、run receiptに基づいてhandoffを書く。
- 不確かな項目はunconfirmedとして明示する。
- next actionは小さく、実行と検証が可能な単位にする。
- real logs、restricted values、personal information、local-only pathsを含めない。
- safety concernを文章から消さず、引き継ぎに残す。

## Minimum Useful Handoff

有用なhandoffは次に答えます。

- 何を試したか。
- 何が変わったか。
- どのevidenceがあるか。
- 何がまだreviewを必要としているか。
- 次に何をしてはいけないか。
