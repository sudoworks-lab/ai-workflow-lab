import { test } from "node:test";
import * as assert from "node:assert/strict";
import { main } from "../src/cli";

function captureConsole(fn: () => number): { status: number; output: string; error: string } {
  const originalLog = console.log;
  const originalError = console.error;
  const output: string[] = [];
  const error: string[] = [];
  console.log = (...args: unknown[]) => {
    output.push(args.join(" "));
  };
  console.error = (...args: unknown[]) => {
    error.push(args.join(" "));
  };
  try {
    return { status: fn(), output: output.join("\n"), error: error.join("\n") };
  } finally {
    console.log = originalLog;
    console.error = originalError;
  }
}

test("CLI help exits zero and lists gate commands", () => {
  const result = captureConsole(() => main(["help"]));
  assert.equal(result.status, 0);
  assert.match(result.output, /regression/);
  assert.match(result.output, /gate/);
  assert.match(result.output, /run-all/);
});

test("CLI unknown command exits non-zero", () => {
  const result = captureConsole(() => main(["unknown-command"]));
  assert.equal(result.status, 1);
  assert.match(result.error, /Unknown command/);
});
