# Workflow

このworkflowは、AI-assisted executionを短い改善ループとして扱います。

## 1. Taskを定義する

`prompts/codex_task.md` を使って次を明示します。

- Objective。
- Scope。
- Allowed reading。
- Required implementation。
- Verification commands。
- Safety constraints。
- Reporting format。

良いtaskは、reviewerがpass/failを判断できる程度にboundedです。

## 2. 制約内で実行する

executorは要求された作業だけを行います。追加contextが必要な場合は、scopeを黙って広げず、その理由を記録します。

executionはmanual、AI-assisted、script-drivenのいずれでも構いません。このworkflowが重視するのは、最初のdraftをどのtoolが作ったかではなくtraceabilityです。

## 3. Run Receiptを残す

run receiptは次を記録します。

- task と input reference。
- expected output。
- artifacts changed。
- checks performed。
- risks found。
- review points。
- follow-up actions。

これにより、chat resultを後からreviewできるevidenceへ変換します。

## 4. Structured Recordを検証する

実行します。

```bash
npm run validate
```

validationはgolden caseやrun receiptのmissing field、wrong basic typeを検出します。これはmechanical gateであり、品質判断ではありません。

## 5. Output Qualityをレビューする

`prompts/review_gate.md` を使って判断します。

- `pass`: stated scopeに対して許容できる。
- `revise`: 有用だが不完全。
- `reject`: unsafe、unverifiable、またはout of scope。

reviewではartifact、check、receiptからevidenceを引用します。

review outputを記録する場合は、`schemas/review_result.schema.json` に従うfileを `examples/review_results/` に書きます。

## 6. Safety Reviewを実行する

実行します。

```bash
npm run scan
```

safety gateはrisky termを検索します。checklistやpolicyのhitは、manual context reviewの後にだけ許可します。実値は削除します。

## 7. 改善を戻す

作業がfailした場合は、次のいずれかを更新します。

- Task prompt。
- Review gate prompt。
- Handoff prompt。
- Schema。
- Golden case。
- Operations doc。
- TODO public review list。

このloopは、failureが現在のoutputだけでなくsystem側の改善につながる場合に価値があります。

## Templates

再利用可能なplaceholderは `templates/` 配下にあります。意図的にgenericにしているため、`examples/` にコピーする前にsyntheticかつpublic-safeな値へ置き換えます。
