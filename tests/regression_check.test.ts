import { test } from "node:test";
import * as assert from "node:assert/strict";
import { runEvaluation } from "../src/eval_runner";
import { countsFromEval, runRegressionCheck } from "../src/regression_check";

test("countsFromEval reports baseline comparable counts", () => {
  const evalResult = runEvaluation("2026-05-28T10:20:00Z");
  const counts = countsFromEval(evalResult);
  assert.deepEqual(counts, {
    passed: 3,
    needs_review: 3,
    failed: 0,
    blocked: 2,
    risk_high: 1,
  });
});

test("runRegressionCheck passes when current eval matches baseline", () => {
  const evalResult = runEvaluation("2026-05-28T10:20:00Z");
  const result = runRegressionCheck("baselines/eval_baseline.json", evalResult.generated_at, evalResult);
  assert.equal(result.status, "pass");
  assert.equal(result.delta.failed, 0);
  assert.equal(result.delta.blocked, 0);
});
