import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { main as evalMain } from "./eval_runner";
import { main as scanMain } from "./public_safety_scan";
import { main as gateMain } from "./quality_gate";
import { main as regressionMain } from "./regression_check";
import { main as reportMain } from "./report_generator";
import { main as smokeMain } from "./smoke_test";
import { main as summaryMain } from "./workflow_summary";
import { main as validateMain } from "./validate_json";

const ROOT = process.cwd();

type Command = {
  description: string;
  run: () => number;
};

const COMMANDS: Record<string, Command> = {
  help: {
    description: "Show CLI help.",
    run: () => {
      printHelp();
      return 0;
    },
  },
  validate: {
    description: "Validate schemas and example JSON files.",
    run: validateMain,
  },
  scan: {
    description: "Run the public-safety term scan.",
    run: scanMain,
  },
  summary: {
    description: "Print the portfolio workflow summary.",
    run: summaryMain,
  },
  eval: {
    description: "Run local workflow evaluation.",
    run: evalMain,
  },
  regression: {
    description: "Compare evaluation results against the baseline.",
    run: regressionMain,
  },
  gate: {
    description: "Run the publication quality gate.",
    run: gateMain,
  },
  report: {
    description: "Generate the Markdown report.",
    run: reportMain,
  },
  "run-all": {
    description: "Run validate, scan, summary, eval, regression, gate, report, test, and smoke.",
    run: runAll,
  },
  smoke: {
    description: "Run the full local smoke test.",
    run: smokeMain,
  },
};

function builtTestFiles(): string[] {
  const testDir = path.join(ROOT, "dist/tests");
  if (!fs.existsSync(testDir)) {
    return [];
  }
  return fs
    .readdirSync(testDir)
    .filter((file) => file.endsWith(".test.js"))
    .map((file) => path.join("dist/tests", file))
    .sort();
}

function runTests(): number {
  const testFiles = builtTestFiles();
  if (testFiles.length === 0) {
    console.error("No built test files found. Run npm run build first.");
    return 1;
  }
  const result = spawnSync(`${process.execPath} --test ${testFiles.join(" ")}`, {
    cwd: ROOT,
    encoding: "utf8",
    shell: true,
    stdio: "inherit",
  });
  return result.status ?? 1;
}

function runAll(): number {
  const steps: Array<[string, () => number]> = [
    ["validate", validateMain],
    ["scan", scanMain],
    ["summary", summaryMain],
    ["eval", evalMain],
    ["regression", regressionMain],
    ["gate", gateMain],
    ["report", reportMain],
    ["test", runTests],
    ["smoke", smokeMain],
  ];

  for (const [name, run] of steps) {
    console.log("");
    console.log(`== ${name} ==`);
    const status = run();
    if (status !== 0) {
      console.error(`run-all stopped at ${name}`);
      return status;
    }
  }

  return 0;
}

function printHelp(): void {
  console.log("AI Workflow Lab CLI");
  console.log("");
  console.log("Usage:");
  console.log("  npm run cli -- <command>");
  console.log("");
  console.log("Commands:");
  for (const [name, command] of Object.entries(COMMANDS)) {
    console.log(`  ${name.padEnd(8)} ${command.description}`);
  }
}

export function main(argv = process.argv.slice(2)): number {
  const commandName = argv[0];
  if (!commandName || commandName === "--help" || commandName === "-h") {
    printHelp();
    return commandName ? 0 : 1;
  }

  const command = COMMANDS[commandName];
  if (!command) {
    console.error(`Unknown command: ${commandName}`);
    console.error("");
    printHelp();
    return 1;
  }

  return command.run();
}

if (require.main === module) {
  process.exitCode = main();
}
