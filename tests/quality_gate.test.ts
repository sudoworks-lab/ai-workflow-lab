import { test } from "node:test";
import * as assert from "node:assert/strict";
import { runQualityGate } from "../src/quality_gate";

test("runQualityGate returns needs_review for review-required sample set", () => {
  const result = runQualityGate("2026-05-28T10:30:00Z");
  assert.equal(result.status, "needs_review");
  assert.ok(result.checks.some((check) => check.name === "regression" && check.status === "pass"));
  assert.ok(result.reasons.includes("evaluation includes cases that require review"));
});
