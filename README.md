# AI Workflow Lab Public

TypeScriptで作った小さな LLM Ops / AI workflow 基盤です。AI作業を「実行して終わり」にせず、ローカル検証、public-safety scan、workflow summary、eval、regression check、risk score、quality gate、report、artifact、test、CI候補までを一つの確認ループとして扱います。

これはチャットボットのデモでも、記事生成やSNS運用のパイプラインでもありません。採用担当者やエンジニアが30秒で読んで、「AI作業を評価・制御・証跡化するための、小さく再現可能なTypeScript基盤」だと分かることを目的にしています。

## 30秒で分かること

- 実装の中心は `src/` 配下の TypeScript tooling です。
- `npm run cli -- run-all` で validate、scan、summary、eval、regression、gate、report、test、smoke をまとめて実行します。
- `examples/golden_cases/` には成功すべきケースと、レビューまたは拒否すべきnegative caseがあります。
- `baselines/eval_baseline.json` により eval drift を見える化します。
- `artifacts/latest/` と `reports/latest.md` に、レビュー可能な実行証跡を生成します。
- `docs/adr/` には、local TypeScript tooling、外部APIなし、policy gate、golden/negative case、regression、quality gate を選んだ理由を残しています。
- shell script は互換用の薄いlauncherに限定しています。

## Architecture Overview

![Architecture Overview](docs/images/architecture-overview.svg)

## Execution Flow

![Execution Flow](docs/images/execution-flow.svg)

## Quick Start

ローカルのヘルスチェック全体を実行します。

```bash
npm install
npm run smoke
```

CLIの完全な実行経路を確認します。

```bash
npm run cli -- run-all
```

直近の生成証跡を確認します。

```bash
npm run report
cat reports/latest.md
ls artifacts/latest
```

quality gate が `needs_review` を返しても、コマンド自体は成功することがあります。negative case や人間の公開前レビューが必要な項目を検出している場合、これは期待される挙動です。

## 主要コマンド

| Command | Purpose |
| --- | --- |
| `npm run validate` | schema、example、config、eval result、regression result、gate result をローカルの簡易schema subsetで検証します。 |
| `npm run scan` | docs、prompts、examples、templates、config、reports、review TODO に対して public-safety term scan を実行します。 |
| `npm run summary` | golden case、run receipt、review result からportfolio summaryを生成します。 |
| `npm run eval` | positive / negative golden case を評価します。 |
| `npm run regression` | 現在のeval countを `baselines/eval_baseline.json` と比較します。 |
| `npm run gate` | validate、scan、eval、regression、risk、review result status を統合し、publication-readiness resultを出します。 |
| `npm run report` | `reports/latest.md` を生成します。 |
| `npm run test` | Node `node:test` のテストスイートを実行します。 |
| `npm run smoke` | end-to-end のローカルrepoヘルスチェックを実行します。 |
| `npm run cli -- <command>` | `validate`、`scan`、`summary`、`eval`、`regression`、`gate`、`report`、`run-all`、`smoke` を単一CLI entrypointから実行します。 |

## まず見るべきもの

- `docs/walkthrough.md`: 3分、5分、10分、面接準備のレビュー経路。
- `docs/architecture.md`: system component と gate の関係。
- `docs/evaluation.md`: eval、risk score、regression、quality gate の挙動。
- `docs/operations.md`: repoの運用方法と生成証跡の見方。
- `docs/adr/`: 実装言語、local execution、review gate の設計判断。
- `TODO_public_review.md`: 公開前に人間が確認する最終チェックリスト。

## Repository Map

```text
.
├── src/                         TypeScript implementation logic
├── tests/                       node:test coverage for core behavior
├── schemas/                     JSON record shapes
├── examples/                    public-safe sample cases, receipts, and results
├── templates/                   reusable placeholders for new workflow assets
├── config/risk_policy.json      local risk scoring policy
├── workflow.config.json         local workflow configuration
├── baselines/                   accepted eval baseline counts
├── artifacts/latest/            generated eval, regression, gate, and summary evidence
├── reports/latest.md            generated Markdown report
├── docs/                        architecture, operations, evaluation, walkthrough, ADRs, images
├── .github/workflows/ci.yml     CI candidate
├── LICENSE                      MIT license
└── TODO_public_review.md        final public-review checklist
```

## 実行フロー

```text
prompt / task
  -> validate
  -> public safety scan
  -> eval
  -> risk score
  -> regression
  -> quality gate
  -> report and artifacts
  -> human review
  -> next action
```

このループは意図的に小さく保っています。bounded taskを定義し、証跡を残し、構造を検証し、安全性リスクをscanし、golden/negative caseを評価し、baselineと比較し、quality gateを通して、レビュー可能なartifactを生成します。

## LLM Ops / SRE / Platform Engineering としての価値

このrepoは、AI-assisted workをSRE、Platform Engineering、AIOps、LLM Opsで重要になる運用実務へ接続します。

- open-ended promptではなく、bounded task contractとして扱う。
- human review前にlocal deterministic checkを通す。
- 期待される拒否・差し戻し経路をeval caseに含める。
- regression checkによりworkflow driftを見える化する。
- quality gateにより、機械的passと公開可能性を分ける。
- handoff evidenceとしてartifactとreportを生成する。
- ADRにより設計上のtradeoffを明示する。
- local checkと同じ経路をCI候補として用意する。

## Public-Safe Scope

このrepoは合成サンプルのみを使います。実運用記録、実在組織名、local-only path、制限値は含めません。外部LLM APIも呼びません。

公開前には次を実行します。

```bash
npm run cli -- run-all
rg -n "token|secret|password|api_key|credential|client_secret|private|customer|顧客|社内|実名|email|mail" .
```

そのうえで `TODO_public_review.md`、`reports/latest.md`、`artifacts/latest/`、SVG diagram、`LICENSE` を人間が確認します。
