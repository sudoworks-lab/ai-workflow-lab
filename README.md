# AI Workflow Lab

AI支援作業をローカルで検証するための TypeScript製ツール群です。

AIに作業を依頼すると、指示内容、出力、確認観点、レビュー結果などの管理がチャット上のみになりがちです。
それらをJSONやMarkdownとして残し、後から検証、比較、レビューできる形にします。

記録した内容に対して、形式チェック、公開前チェック、作業結果の評価、前回結果との差分確認、レビュー要否の判定、レポート生成を行います。

外部 LLM API は使いません。
実データも使いません。
合成サンプルだけで動く構成です。

## Features

- TypeScript CLI
- schema validation
- public-safety scan
- golden / negative cases
- eval runner
- regression check
- risk score
- quality gate
- reports / artifacts
- ADR
- GitHub Actions

## Architecture

![Architecture Overview](docs/images/architecture-overview.svg)

## Flow

![Execution Flow](docs/images/execution-flow.svg)

## Quick Start

依存関係を入れて、全体の確認を実行します。

    npm install
    npm run cli -- run-all

このコマンドでは、形式チェック、公開前チェック、作業結果の確認、前回結果との差分確認、レポート生成までをまとめて実行します。

実行結果は標準出力に表示されます。
あわせて `reports/latest.md` と `artifacts/latest/` に確認用の結果を出力します。

## Commands

| Command | Description |
| --- | --- |
| `npm run validate` | schemas、examples、config、実行結果の形式を確認します。 |
| `npm run scan` | docs、prompts、examples、templates、reports などを対象に、公開リスクにつながる語句を検出します。 |
| `npm run summary` | golden case、run receipt、review result から概要を生成します。 |
| `npm run eval` | positive / negative golden case の確認結果を生成します。 |
| `npm run regression` | 現在の確認結果を baseline と比較します。 |
| `npm run gate` | 各チェック結果をもとに、完了扱いにできるか、目視レビューが必要かを判定します。 |
| `npm run report` | `reports/latest.md` を生成します。 |
| `npm run test` | Node.js の `node:test` でテストを実行します。 |
| `npm run smoke` | repo全体のローカルヘルスチェックを実行します。 |
| `npm run cli -- <command>` | `validate`、`scan`、`summary`、`eval`、`regression`、`gate`、`report`、`run-all`、`smoke` をCLIから実行します。 |

## Repository Map

    .
    ├── src/                         TypeScript の実装
    ├── tests/                       node:test によるテスト
    ├── schemas/                     JSON の形式定義
    ├── examples/                    合成データのサンプル
    ├── templates/                   新しい記録を作るための雛形
    ├── config/risk_policy.json      ローカルで使うリスク判定ルール
    ├── workflow.config.json         ワークフロー設定
    ├── baselines/                   前回基準として使う確認結果
    ├── artifacts/latest/            eval / regression / gate / summary の生成結果
    ├── reports/latest.md            生成された Markdown レポート
    ├── docs/                        設計、運用、ADR、構成図
    ├── .github/workflows/ci.yml     GitHub Actions の設定
    ├── LICENSE                      MIT License
    └── TODO_public_review.md        公開前チェックリスト

## Docs

- `docs/walkthrough.md`
  全体の読み方と確認手順。

- `docs/architecture.md`
  CLI、各check、config、artifacts の関係。

- `docs/workflow.md`
  AI支援作業を記録し、確認できる状態にする流れ。

- `docs/evaluation.md`
  eval、risk score、regression、quality gate の考え方。

- `docs/operations.md`
  日常的な実行手順と生成物の扱い。

- `docs/public-safety.md`
  公開前チェックの観点。

- `docs/adr/`
  設計判断の記録。

## Safety

このrepoは合成データだけを扱います。
実運用ログ、実在組織名、個人情報、認証情報、ローカル専用パスは含めません。

公開前には次を確認します。

    npm run cli -- run-all
    rg -n "token|secret|password|api_key|credential|client_secret|private|customer|顧客|社内|実名|email|mail" .

自動チェックの結果だけで公開判断はせず、公開前に `reports/latest.md`、`artifacts/latest/`、`TODO_public_review.md` を目視確認します。

## License

MIT License.
