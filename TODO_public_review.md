# TODO Public Review

公開済みrepoとして継続的に確認する項目です。local check が pass した後に、README、docs、生成物、公開リスクを目視確認します。

## 表示確認

- `README.md` の最初の画面で、このrepoがTypeScript製の LLM Ops / AI workflow 基盤 だと説明できていることを確認する。
- Quick Start と command table が追いやすいことを確認する。
- SRE、Platform Engineering、AIOps、LLM Opsとの接続が正確で、過剰主張になっていないことを確認する。
- `docs/images/architecture-overview.svg` がREADME 上で正しく表示されることを確認する。
- `docs/images/execution-flow.svg` がREADME 上で正しく表示されることを確認する。
- `docs/walkthrough.md` が、全体像、実行方法、設計意図を段階的に確認できる導線になっていることを確認する。

## 生成物確認

- `npm run cli -- run-all` を実行する。
- `reports/latest.md` がsynthetic sampleから生成されたevidenceだけを含むことを確認する。
- 追跡対象の `artifacts/latest/eval_result.json` が存在し、review可能であることを確認する。
- 追跡対象の `artifacts/latest/regression_result.json` が存在し、review可能であることを確認する。
- 追跡対象の `artifacts/latest/quality_gate_result.json` が存在し、review可能であることを確認する。
- 追跡対象の `artifacts/latest/summary.md` が存在し、review可能であることを確認する。
- quality gate の `needs_review` reason が継続レビューの期待状態であることを確認する。
- `baselines/eval_baseline.json` が受け入れ済みevaluation baselineを表していることを確認する。

## 公開リスク確認

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

## License / 継続運用確認

- `LICENSE` が存在し、意図したMIT termsとcopyright lineを含むことを確認する。
- `.github/workflows/ci.yml` が公開済みrepoのCIとしてそのまま維持できる内容か確認する。
- CIが `npm ci`、typecheck、build、validate、scan、summary、eval、regression、gate、report、test、smokeを実行することを確認する。
- 最新CI状態を GitHub Actions で確認する。
- manual public review の結果と README / docs / 追跡生成物の内容に矛盾がないことを確認する。

## 既知の制約

- validator は JSON Schema の簡易 subset 実装。
- shell script は互換用入口。主な操作は npm scripts に集約。
- risk scoring はルールベースの簡易判定。
- regression baseline は、レビュー後にのみ更新する。

## 継続レビュー メモ

- SRE / Platform Engineering / AIOps / LLM Ops との接続は残す。
- SNS投稿や記事生成は主用途にしない。
- 大きな自動化主張より、小さく検証できる workflow を優先する。
- README、diagram、CI、継続レビュー項目に矛盾がない状態を維持する。
