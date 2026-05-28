import { test } from "node:test";
import * as assert from "node:assert/strict";
import { parseAllJsonFiles, validateAll } from "../src/validate_json";

test("validateAll passes all configured sample targets", () => {
  const results = validateAll();
  assert.ok(results.length >= 11);
  assert.equal(results.filter((result) => result.status === "FAIL").length, 0);
  assert.ok(results.some((result) => result.label === "eval result"));
  assert.ok(results.some((result) => result.label === "workflow config"));
});

test("parseAllJsonFiles includes config and templates", () => {
  const files = parseAllJsonFiles();
  assert.ok(files.includes("workflow.config.json"));
  assert.ok(files.includes("config/risk_policy.json"));
  assert.ok(files.includes("templates/golden_cases/golden_case.template.json"));
});
