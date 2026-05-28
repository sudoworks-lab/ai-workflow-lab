# ADR 0004: Golden And Negative Cases

## Background

positive exampleだけでは、workflowがunsafeまたはincompleteなrequestをどう扱うかを示せません。

## Decision

`examples/golden_cases/` 配下にgolden caseとnegative caseの両方を置きます。

## Reason

同じevaluatorで、有用なpathと期待される拒否・差し戻しpathの両方を検証できます。

## Impact

negative caseはreview-required outcomeを返すことが期待されます。これらはsyntheticであり、real operational dataを含めてはいけません。
