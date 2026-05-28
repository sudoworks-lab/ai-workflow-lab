# ADR 0003: Policy-Based Review Gate

## Background

public-safetyとquality reviewには、reviewerの記憶に依存しない明示的な基準が必要です。

## Decision

documented prompts、schemas、risk policy、quality gate outputを使い、review decisionをtraceableにします。

## Reason

policy-based reviewにより、failureがactionableになり、別のoperatorでもresultがpass、needs review、blockedになった理由を理解できます。

## Impact

quality gateは保守的です。negative caseやhigh-risk caseでは `needs_review` が期待される状態であり、引き続き人間の判断が必要です。
