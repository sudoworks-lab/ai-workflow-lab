# Walkthrough

このwalkthroughは、公開前レビューや面接での説明前に、このrepoの要点を短時間で把握するためのものです。

## 3分: シグナルを読む

まず、このrepoが何を示しているかを説明する部分だけを見ます。

1. `README.md` の最初の画面を読む。
2. `docs/images/architecture-overview.svg` を見る。
3. `docs/images/execution-flow.svg` を見る。
4. `reports/latest.md` を開き、生成されたreview reportを見る。
5. `artifacts/latest/` を開き、eval、regression、quality gate、summaryの証跡を見る。

見るべきシグナルは、小さなTypeScript workflow platformです。local check、eval、risk scoring、baseline comparison、gate、artifact、report、human reviewが一つの流れになっています。

## 5分: 実行する

依存関係を入れ、end-to-endのlocal pathを実行します。

```bash
npm install
npm run cli -- run-all
```

特定の層だけを確認する場合は、focused checkを実行します。

```bash
npm run validate
npm run scan
npm run eval
npm run regression
npm run gate
npm run report
npm run test
npm run smoke
```

期待される結果は次の通りです。

- JSON examples と config が簡易schema checkを通る。
- safety scan に disallowed hit がない。
- positive case はpassし、negative case はreviewへ回る。
- regression が受け入れ済みbaselineと一致する。
- quality gate がレビュー可能なpublication-readiness statusを返す。
- report と artifact files がローカルで生成される。

## 10分: 設計を見る

system shapeを理解するには、次の順に見ます。

1. `docs/architecture.md`: component と gate の関係。
2. `docs/evaluation.md`: eval、risk score、regression、quality gate の挙動。
3. `docs/operations.md`: case、receipt、review result、baseline の追加・運用方法。
4. `schemas/*.json`: record model。
5. `src/cli.ts`, `src/eval_runner.ts`, `src/risk_score.ts`, `src/regression_check.ts`, `src/quality_gate.ts`: TypeScript core。
6. `tests/*.test.ts`: local behavior coverage。
7. `docs/adr/`: 設計判断。
8. `.github/workflows/ci.yml`: CI候補。

設計はlocal-firstかつpublic-safeにしています。特定のmodel vendorに依存せず、AI作業を制御・評価・証跡化するworkflow mechanicsを示すためです。

## 面接前に見る順番

1. `README.md`
2. `reports/latest.md`
3. `artifacts/latest/quality_gate_result.json`
4. `examples/golden_cases/`
5. `baselines/eval_baseline.json`
6. `docs/adr/0005-regression-and-quality-gate.md`
7. `TODO_public_review.md`
8. `LICENSE`

quality gate が `needs_review` でもコマンドが成功する理由を説明できるようにしておきます。negative caseや公開前レビュー項目は、人間の判断が必要な状態として扱うためです。
