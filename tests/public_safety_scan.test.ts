import { test } from "node:test";
import * as assert from "node:assert/strict";
import { scanPublicFiles } from "../src/public_safety_scan";

test("public safety scan has no disallowed hits", () => {
  const hits = scanPublicFiles();
  assert.equal(hits.filter((hit) => !hit.allowed).length, 0);
});

test("public safety scan reports policy hits for manual review", () => {
  const hits = scanPublicFiles();
  assert.ok(hits.some((hit) => hit.reason.includes("policy")));
});
