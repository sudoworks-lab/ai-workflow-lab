# Operations

このrepoはroot directoryから操作します。

## Standard Pre-Review Check

```bash
npm install
npm run smoke
```

smoke testは次を実行します。

- 必須ファイルの存在確認。
- JSON parse check。
- simplified schema validation。
- public-safety term scan。
- evaluation runner check。
- regression baseline check。
- quality gate check。
- Markdown report generation。
- Node test suite execution。
- workflow summary generation。

## Individual Checks

JSON validationだけを実行します。

```bash
npm run validate
```

public-safety scanだけを実行します。

```bash
npm run scan
```

workflow summaryを生成します。

```bash
npm run summary
```

evaluationを実行します。

```bash
npm run eval
```

baselineに対するregressionを実行します。

```bash
npm run regression
```

publication quality gateを実行します。

```bash
npm run gate
```

Markdown reportを生成します。

```bash
npm run report
```

testを実行します。

```bash
npm run test
```

同じcheckをCLI entrypoint経由で実行します。

```bash
npm run cli -- validate
npm run cli -- scan
npm run cli -- summary
npm run cli -- eval
npm run cli -- regression
npm run cli -- gate
npm run cli -- report
npm run cli -- run-all
npm run cli -- smoke
```

## Golden Caseを追加する

1. `examples/golden_cases/` にJSON fileを作る。
2. `schemas/golden_case.schema.json` に従う。
3. task、input、expected output、checks、risk、review pointsを含める。
4. `npm run validate` を実行する。`examples/golden_cases/` 配下のfileは自動検出される。
5. `npm run smoke` を実行する。
6. 公開前レビューで判断が必要な点は `TODO_public_review.md` に残す。

## Run Receiptを追加する

1. `examples/run_receipts/` にJSON fileを作る。
2. `schemas/run_receipt.schema.json` に従う。
3. public sampleではすべての値をsyntheticにする。
4. 実際に実行したcommandを含める。
5. skipped checks と residual risks を含める。
6. `npm run smoke` を実行する。

## Review Resultを追加する

1. `examples/review_results/` にJSON fileを作る。
2. `schemas/review_result.schema.json` に従う。
3. status、evidence、findings、required changes、next actionを記録する。
4. synthetic examplesまたはpublic-safe artifactsに紐づける。
5. `npm run validate` と `npm run smoke` を実行する。

## Risk Policyを更新する

1. `config/risk_policy.json` を編集する。
2. termはgenericかつpolicy-orientedに保つ。
3. `schemas/risk_policy.schema.json` に従う。
4. `npm run eval` を実行し、scoring impactを確認する。
5. `npm run test` と `npm run smoke` を実行する。

## Report Operation

`npm run report` は `reports/latest.md` を書き込みます。このreportはgenerated review evidenceとして扱います。人間によるpublic reviewの代替ではありません。

## Artifact Operation

eval、regression、gate、summary commandは、latest execution evidenceを `artifacts/latest/` に書き込みます。

- `eval_result.json`
- `regression_result.json`
- `quality_gate_result.json`
- `summary.md`

これらは生成された証跡です。公開前に内容を確認します。

## Baselineを更新する

`baselines/eval_baseline.json` は、人間が新しいeval behaviorを受け入れた後にだけ更新します。更新前後に `npm run regression` を実行し、意図したdeltaであることを確認します。

## ADRs

設計判断は `docs/adr/` に置きます。implementation language、external dependency boundary、review policy、case strategy、gate behaviorを変える場合は短いADRを追加します。

## Templates

`templates/` 配下のfileはstarting pointとしてだけ使います。placeholder textをsyntheticかつpublic-safeな値に置き換えてから `examples/` へ移動します。

## Failure Handling

validationがfailした場合は次を行います。

- まずmissing fieldやwrong typeを直す。
- schemaが間違っているのか、sampleが間違っているのかを判断する。
- 実際の修正までfailureを見える状態にする。
- passさせるためだけにrequired fieldを弱めない。

public-safety scanがhitを出した場合は次を行います。

- 各hitがpolicy/checklist textなのか、実値なのかを確認する。
- policy/checklist hitは必要な場合だけ残す。
- 実値は削除し、generic placeholderに置き換える。
- 未解決の判断は `TODO_public_review.md` に追加する。

## Operating Boundary

このrepoはpublic sampleです。storage、access control、audit retention、execution isolationを別途設計するまでは、production automation systemとして扱わないでください。

## Implementation Boundary

repo checkとsummaryは `src/` 配下のTypeScriptで実装し、npm scripts経由で公開します。shell fileは `npm run` を呼ぶ薄いcompatibility launcherとしてだけ残します。
