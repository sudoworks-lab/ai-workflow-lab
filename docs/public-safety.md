# Public Safety

public safetyはこのrepoのfirst-class gateです。公開済みrepoとして、sampleはworkflow designを説明するためのものであり、実在する人物、組織、system、operational dataを公開しないことを前提にします。

## Excluded Content

次を含めないでください。

- 個人情報。
- 実在するcustomer名。
- 内部organization名。
- 内部project名。
- email address。
- API keys。
- token values。
- password values。
- credential values。
- client_secret values。
- private keys。
- real logs。
- local-only paths。
- 非公開repoや非公開documentからコピーしたtext。

## Safety Gate

safety gateは2つの部分で構成します。

- Mechanical scan: `npm run scan`
- Human context review: 各hitを見て、checklist textなのかunsafe contentなのかを判断する。

mechanical scanは意図的に保守的です。危険なlanguageを静かに見逃すより、review workを発生させることを優先します。

## Allowlisted Hits

safety docsやreview checklistでは、一部のrisky termが想定されます。これらはpolicy languageとしてのみ許可します。例として、検索pattern自体やexcluded contentのlistがあります。

allowlisted hitには実値を含めてはいけません。

## Public Sample Rules

- synthetic ID と timestamp を使う。
- `demo-service` や `sample-docs` のようなgeneric component nameを使う。
- realistic log lineを含めない。
- local machine pathを避ける。
- internal procedureではなくoperational patternを説明する。
- 不確かな詳細は公開せず、review TODOとして残す。

## 公開状態維持チェック

1. `npm run smoke` を実行する。
2. `npm run scan` の全outputを確認する。
3. 残ったrisky termがchecklistまたはpolicy termであることを確認する。
4. exampleと、追跡対象の `artifacts/latest/` がsyntheticであることを確認する。
5. READMEがproduction readinessを過剰に主張していないことを確認する。
6. `TODO_public_review.md` に未解決blockerがないことを確認する。

## Decision Rule

詳細が曖昧な場合はpublic fileから削除し、質問を `TODO_public_review.md` に記録します。
