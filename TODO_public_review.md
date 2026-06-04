# TODO Public Review

公開前に確認する項目です。local check が pass した後に、README、docs、生成物、公開リスクを目視確認します。

## 表示確認

- `README.md` の最初の画面で、このrepoがTypeScript製の LLM Ops / AI workflow 基盤 だと説明できていることを確認する。
- Quick Start と command table が追いやすいことを確認する。
- SRE、Platform Engineering、AIOps、LLM Opsとの接続が正確で、過剰主張になっていないことを確認する。
- `docs/images/architecture-overview.svg` がREADME上で正しくrenderされることを確認する。
- `docs/images/execution-flow.svg` がREADME上で正しくrenderされることを確認する。
- `docs/walkthrough.md` が、全体像、実行方法、設計意図を段階的に確認できる導線になっていることを確認する。

## Generated Evidence Checks

- `npm run cli -- run-all` を実行する。
- `reports/latest.md` がsynthetic sampleから生成されたevidenceだけを含むことを確認する。
- `artifacts/latest/eval_result.json` が存在し、review可能であることを確認する。
- `artifacts/latest/regression_result.json` が存在し、review可能であることを確認する。
- `artifacts/latest/quality_gate_result.json` が存在し、review可能であることを確認する。
- `artifacts/latest/summary.md` が存在し、review可能であることを確認する。
- quality gate の `needs_review` reason が公開前の期待状態であることを確認する。
- `baselines/eval_baseline.json` が受け入れ済みevaluation baselineを表していることを確認する。

## Public Safety Checks

- すべてのexampleがsyntheticかつpublic-safeであることを確認する。
- 実在するorganization、customer、project、personを識別できないことを確認する。
- email address、token、secret、password、credential、client_secret、private key、local-only pathが存在しないことを確認する。
- dangerous-term scanを実行し、すべてのhitを確認する。

```bash
rg -n "token|secret|password|api_key|credential|client_secret|private|customer|顧客|社内|実名|email|mail" .
```

- 残るrisky hitがscanner definition、risk policy definition、checklist term、public-safety policy textだけであることを確認する。
- sample receiptがproduction executionを示唆していないことを確認する。
- templateが再利用可能なplaceholderだけで、実データを含まないことを確認する。

## License And Release Checks

- `LICENSE` が存在し、意図したMIT termsとcopyright lineを含むことを確認する。
- 公開後に `.github/workflows/ci.yml` をそのまま有効化してよいか確認する。
- CIが `npm ci`、typecheck、build、validate、scan、summary、eval、regression、gate、report、test、smokeを実行することを確認する。
- manual public review が完了するまで repository を public 化しないことを確認する。

## Known Weak Points

- CIはcandidate workflowとして用意しているが、remote repository上ではまだ実行していない。
- simplified validatorは完全なJSON Schema implementationではない。
- shell entrypointはcompatibility launcherであり、maintained interfaceはTypeScript npm scriptsである。
- risk scoringはheuristicであり、完全なsafety classifierとして扱わない。
- regression baseline countは人間が受け入れるものであり、review後にだけ更新する。

## Public Decision Notes

- SRE、Platform Engineering、AIOps、LLM Opsを主軸のframingとして維持する。
- social postingやarticle-generation use caseをmain narrativeにしない。
- broad automation claimより、小さく検証可能なworkflow exampleを優先する。
- README、diagram、CI behavior、public-safety reviewが完了するまでfeature additionを止める。
