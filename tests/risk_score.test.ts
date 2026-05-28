import { test } from "node:test";
import * as assert from "node:assert/strict";
import { RiskPolicy, scoreText } from "../src/risk_score";

const policy: RiskPolicy = {
  policyName: "test-policy",
  blockedThreshold: 9,
  highThreshold: 6,
  mediumThreshold: 3,
  categories: [
    { name: "review_gate_bypass", weight: 3, terms: ["skip review"] },
    { name: "public_release_risk", weight: 3, terms: ["publish directly"] },
    { name: "dangerous_terms", weight: 4, terms: ["restricted_marker"] },
  ],
};

test("scoreText returns low when no risk terms are present", () => {
  const result = scoreText("bounded synthetic workflow case", policy);
  assert.equal(result.level, "low");
  assert.equal(result.score, 0);
});

test("scoreText escalates when multiple risk categories match", () => {
  const result = scoreText("skip review and publish directly", policy);
  assert.equal(result.level, "high");
  assert.equal(result.score, 6);
  assert.equal(result.findings.length, 2);
});

test("scoreText returns blocked at the blocked threshold", () => {
  const result = scoreText("skip review, publish directly, and include restricted_marker value", policy);
  assert.equal(result.level, "blocked");
  assert.equal(result.score, 10);
});
