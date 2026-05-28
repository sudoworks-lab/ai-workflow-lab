import { test } from "node:test";
import * as assert from "node:assert/strict";
import { runEvaluation } from "../src/eval_runner";

test("runEvaluation separates positive and negative cases", () => {
  const result = runEvaluation("2026-05-28T10:10:00Z");
  assert.equal(result.totals.cases, 6);
  assert.equal(result.totals.positive, 3);
  assert.equal(result.totals.negative, 3);
  assert.equal(result.totals.fail, 0);
  assert.ok(result.totals.needs_review >= 3);
});

test("negative cases are never treated as direct pass", () => {
  const result = runEvaluation("2026-05-28T10:10:00Z");
  const negativeResults = result.case_results.filter((item) => item.case_type === "negative");
  assert.equal(negativeResults.length, 3);
  assert.ok(negativeResults.every((item) => item.status === "needs_review"));
});
