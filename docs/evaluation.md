# Evaluation

このrepoのevaluationはmodel benchmarkではなく、workflow evaluationです。見るべき問いは、プロセスがレビュー可能で、安全で、検証可能な作業を十分な証跡付きで生成し、pass・revise・rejectを判断できるかです。

## Evaluation Assets

現在のgolden caseは3つのoperating modeを扱います。

- Development support: `examples/golden_cases/roblox_game_dev.json`
- Log collection planning: `examples/golden_cases/log_auto_collect.json`
- Documentation maintenance: `examples/golden_cases/docs_maintenance.json`

negative caseは、期待される拒否または差し戻し経路を扱います。

- Overbroad agent access: `examples/golden_cases/negative_overbroad_codex_access.json`
- Unsafe log collection: `examples/golden_cases/negative_sensitive_log_collection.json`
- Unreviewed docs publication: `examples/golden_cases/negative_unreviewed_docs_publish.json`

各caseは次を含みます。

- `task`: workflowが行うべきこと。
- `input`: 合成されたtask inputとsource boundary。
- `expected_output`: 必要なartifactとacceptance criteria。
- `checks`: mechanical check と human check。
- `risk`: 想定されるfailure modeとsafety control。
- `review_points`: reviewerが確認すべき点。

## 良い結果の条件

良いworkflow resultは次を満たします。

- 明示されたscope内に留まる。
- 期待されたartifactを生成する。
- run receiptに証跡を記録する。
- schema validationを通る。
- 未検証のassumptionを明示する。
- 公開に危険な詳細を避ける。
- 未完了の場合にactionable follow-upを出す。

## Mechanical Validation

`src/validate_json.ts` は小さなJSON Schema subsetを扱います。

- `type`
- `required`
- `properties`
- `items`

scriptはsample run receiptとすべてのgolden caseを検証します。また、checked filesとfailuresを分けたsummaryを出力します。

review resultは `schemas/review_result.schema.json` で検証されます。人間のreview decisionにも最低限の構造を持たせるためです。

## Eval Runner

local evaluationを実行します。

```bash
npm run eval
```

`src/eval_runner.ts` は `examples/golden_cases/*.json` を読み、positive caseとnegative caseを分け、各caseがworkflow checks、risk controls、review points、acceptance criteriaを持つか確認し、次を返します。

- `pass`: 構造的に十分で、riskがlowまたはmediumのcase。
- `needs_review`: negative caseまたはhigh-risk caseで、人間のreviewが必要なcase。
- `fail`: evaluationに必要な中身が欠けているcase。

output shapeは `schemas/eval_result.schema.json` で定義され、`examples/eval_results/sample_eval_result.json` がpublic-safe sampleを提供します。

## Risk Score

`src/risk_score.ts` は `config/risk_policy.json` を使って次をscoreします。

- Dangerous terms。
- Overbroad access。
- Real-log-like collection requests。
- Review gate bypass。
- Public release risk。

scoreは `low`、`medium`、`high`、`blocked` に対応します。処理はdeterministicかつlocalで、外部APIを呼びません。

## Reports

実行します。

```bash
npm run report
```

report generatorはvalidation、public-safety scan、evaluation、workflow summaryを統合し、`reports/latest.md` を生成します。

## Regression

実行します。

```bash
npm run regression
```

`src/regression_check.ts` は現在のeval resultを `baselines/eval_baseline.json` と比較します。pass、needs-review、fail、blocked-risk、high-risk countを監視し、悪化があれば `needs_review` または `blocked` を返します。

## Quality Gate

実行します。

```bash
npm run gate
```

`src/quality_gate.ts` はvalidation、safety scan、eval、regression、risk scoring、review result statusを統合し、publication-readiness resultを一つにまとめます。

- `pass`: final public reviewへ進める。
- `needs_review`: 機械的には利用可能だが、人間のreviewがまだ必要。
- `blocked`: publication reviewへ進む前に修正が必要。

生成されたexecution evidenceは `artifacts/latest/` に書き込まれます。

## Human Evaluation

mechanical validationだけでは不十分です。reviewerは次を確認します。

- taskが現実的でboundedか。
- expected outputが有用か。
- checkがfailureを捕まえる強さを持つか。
- risk controlが具体的か。
- public-safety languageがchecklist languageに留まっているか。

## Regression Use

promptやschemaを変更した場合は次を実行します。

```bash
npm run smoke
npm run regression
npm run gate
npm run test
```

golden caseがfailした場合、caseを変えるべきかschemaを変えるべきかを判断します。testを通すためだけにschemaを弱めないでください。
