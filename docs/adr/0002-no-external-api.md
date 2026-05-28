# ADR 0002: No External API

## Background

このrepoはpublic-safeなworkflow sampleであり、hidden serviceやoperational dataに依存してはいけません。

## Decision

すべてのcheck、evaluation、risk scoring、reportは外部API callなしでlocalに実行します。

## Reason

local-only executionにより、公開前に再現可能で、inspectableで、安全に実行できるsampleになります。

## Impact

このrepoが示すのはmodel qualityではなくworkflow mechanicsです。将来のexternal integrationは、default public sample pathの外側に追加する必要があります。
