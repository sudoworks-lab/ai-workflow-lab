# ADR 0005: Regression And Quality Gate

## Background

evaluation outputは、baselineと比較でき、release decisionとして要約できる場合に価値があります。

## Decision

`baselines/eval_baseline.json` に対するregression checkと、validation、scan、eval、regression、risk、review resultを統合するquality gateを追加します。

## Reason

baseline comparisonはworsening behaviorを検出し、quality gateはreview可能なpublication statusを一つにまとめます。

## Impact

commandがpassしても、gateは `needs_review` を返すことがあります。`blocked` resultは、修正されるまでpublication workを止めるべき状態です。
