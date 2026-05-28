# ADR 0001: Use TypeScript For Tooling

## Background

このrepoには、薄いshell glueを超えるlocal validation、evaluation、scoring、reporting、CLI behaviorが必要です。

## Decision

tool bodyはTypeScriptで実装し、npm scripts経由で公開します。

## Reason

TypeScriptにより、JSON recordに型付きの構造を与え、予測可能なlocal executionを保ち、CLI・test・reportで同じ実装を再利用できます。

## Impact

shellはcompatibility launcherとしてだけ残します。新しいworkflow logicは `src/` に追加し、`tests/` でcoverします。
