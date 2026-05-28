import * as fs from "node:fs";
import * as path from "node:path";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

type JsonObject = { [key: string]: JsonValue };

type Schema = {
  type?: string;
  required?: JsonValue;
  properties?: JsonValue;
  items?: JsonValue;
};

export type ValidationResult = {
  label: string;
  schemaPath: string;
  dataPath: string;
  status: "PASS" | "FAIL";
  detail: string;
};

class ValidationError extends Error {}

const ROOT = process.cwd();

function isObject(value: JsonValue): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function loadJson(filePath: string): JsonValue {
  return JSON.parse(fs.readFileSync(path.join(ROOT, filePath), "utf8")) as JsonValue;
}

function findJsonFiles(dirPath: string): string[] {
  const absoluteDir = path.join(ROOT, dirPath);
  if (!fs.existsSync(absoluteDir)) {
    return [];
  }

  const entries = fs.readdirSync(absoluteDir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const relativePath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...findJsonFiles(relativePath));
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      files.push(relativePath);
    }
  }

  return files.sort();
}

function typeName(value: JsonValue): string {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";
  if (typeof value === "object") return "object";
  if (Number.isInteger(value)) return "integer";
  return typeof value;
}

function hasValidType(expectedType: string, data: JsonValue): boolean {
  switch (expectedType) {
    case "object":
      return isObject(data);
    case "array":
      return Array.isArray(data);
    case "string":
      return typeof data === "string";
    case "integer":
      return typeof data === "number" && Number.isInteger(data);
    case "number":
      return typeof data === "number";
    case "boolean":
      return typeof data === "boolean";
    case "null":
      return data === null;
    default:
      throw new ValidationError(`unsupported schema type ${JSON.stringify(expectedType)}`);
  }
}

function asSchema(value: JsonValue, schemaPath: string): Schema {
  if (!isObject(value)) {
    throw new ValidationError(`${schemaPath}: schema node must be an object`);
  }
  return value as Schema;
}

function validate(schemaValue: JsonValue, data: JsonValue, dataPath = "$"): void {
  const schema = asSchema(schemaValue, dataPath);

  if (schema.type !== undefined) {
    if (typeof schema.type !== "string") {
      throw new ValidationError(`${dataPath}: schema type must be a string`);
    }
    if (!hasValidType(schema.type, data)) {
      throw new ValidationError(`${dataPath}: expected ${schema.type}, got ${typeName(data)}`);
    }
  }

  if (schema.type === "object") {
    if (!isObject(data)) {
      throw new ValidationError(`${dataPath}: expected object, got ${typeName(data)}`);
    }

    const required = schema.required ?? [];
    if (!Array.isArray(required) || !required.every((key) => typeof key === "string")) {
      throw new ValidationError(`${dataPath}: schema required must be an array of strings`);
    }

    for (const key of required) {
      if (!(key in data)) {
        throw new ValidationError(`${dataPath}: missing required property ${JSON.stringify(key)}`);
      }
    }

    const properties = schema.properties ?? {};
    if (!isObject(properties)) {
      throw new ValidationError(`${dataPath}: schema properties must be an object`);
    }

    for (const [key, childSchema] of Object.entries(properties)) {
      if (key in data) {
        validate(childSchema, data[key], `${dataPath}.${key}`);
      }
    }
  }

  if (schema.type === "array" && schema.items !== undefined) {
    if (!Array.isArray(data)) {
      throw new ValidationError(`${dataPath}: expected array, got ${typeName(data)}`);
    }

    data.forEach((item, index) => {
      validate(schema.items as JsonValue, item, `${dataPath}[${index}]`);
    });
  }
}

export function validationTargets(): Array<{ label: string; schemaPath: string; dataPath: string }> {
  const goldenCases = findJsonFiles("examples/golden_cases").map((dataPath) => ({
    label: "golden case",
    schemaPath: "schemas/golden_case.schema.json",
    dataPath,
  }));

  const receipts = findJsonFiles("examples/run_receipts").map((dataPath) => ({
    label: "run receipt",
    schemaPath: "schemas/run_receipt.schema.json",
    dataPath,
  }));

  const reviewResults = findJsonFiles("examples/review_results").map((dataPath) => ({
    label: "review result",
    schemaPath: "schemas/review_result.schema.json",
    dataPath,
  }));

  const evalResults = findJsonFiles("examples/eval_results").map((dataPath) => ({
    label: "eval result",
    schemaPath: "schemas/eval_result.schema.json",
    dataPath,
  }));

  const regressionResults = findJsonFiles("examples/regression_results").map((dataPath) => ({
    label: "regression result",
    schemaPath: "schemas/regression_result.schema.json",
    dataPath,
  }));

  const qualityGateResults = findJsonFiles("examples/quality_gate_results").map((dataPath) => ({
    label: "quality gate result",
    schemaPath: "schemas/quality_gate_result.schema.json",
    dataPath,
  }));

  const configTargets = [
    {
      label: "risk policy",
      schemaPath: "schemas/risk_policy.schema.json",
      dataPath: "config/risk_policy.json",
    },
    {
      label: "workflow config",
      schemaPath: "schemas/workflow_config.schema.json",
      dataPath: "workflow.config.json",
    },
  ];

  return [
    ...receipts,
    ...reviewResults,
    ...evalResults,
    ...regressionResults,
    ...qualityGateResults,
    ...goldenCases,
    ...configTargets,
  ];
}

export function parseAllJsonFiles(): string[] {
  const files = [
    ...findJsonFiles("schemas"),
    ...findJsonFiles("examples"),
    ...findJsonFiles("templates"),
    ...findJsonFiles("config"),
    ...findJsonFiles("baselines"),
    "workflow.config.json",
  ];
  for (const file of files) {
    loadJson(file);
  }
  return files;
}

export function validateAll(): ValidationResult[] {
  return validationTargets().map((target) => {
    try {
      validate(loadJson(target.schemaPath), loadJson(target.dataPath));
      return {
        ...target,
        status: "PASS",
        detail: "matches simplified schema",
      };
    } catch (error) {
      return {
        ...target,
        status: "FAIL",
        detail: error instanceof Error ? error.message : String(error),
      };
    }
  });
}

export function printValidationResults(results: ValidationResult[]): void {
  console.log("AI Workflow Lab JSON validation");
  console.log(`root: ${ROOT}`);
  console.log(`targets: ${results.length}`);
  console.log("");

  for (const result of results) {
    console.log(`[${result.status}] ${result.label}: ${result.dataPath}`);
    console.log(`       schema: ${result.schemaPath}`);
    console.log(`       detail: ${result.detail}`);
    console.log("");
  }

  const failed = results.filter((result) => result.status === "FAIL");
  console.log("Summary");
  console.log(`- passed: ${results.length - failed.length}`);
  console.log(`- failed: ${failed.length}`);

  if (failed.length > 0) {
    console.error("");
    console.error("Failures");
    failed.forEach((failure) => {
      console.error(`- ${failure.dataPath}: ${failure.detail}`);
    });
  } else {
    console.log("All sample JSON files passed simplified validation.");
  }
}

export function main(): number {
  try {
    parseAllJsonFiles();
    const results = validateAll();
    printValidationResults(results);
    return results.every((result) => result.status === "PASS") ? 0 : 1;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return 1;
  }
}

if (require.main === module) {
  process.exitCode = main();
}
