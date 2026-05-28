import * as fs from "node:fs";
import * as path from "node:path";

export type SafetyHit = {
  file: string;
  line: number;
  text: string;
  term: string;
  allowed: boolean;
  reason: string;
};

const ROOT = process.cwd();

const SCAN_ROOTS = [
  "README.md",
  "docs",
  "prompts",
  "examples",
  "templates",
  "config",
  "workflow.config.json",
  "reports",
  "LICENSE_CANDIDATE.md",
  "TODO_public_review.md",
];
const RISK_PATTERN =
  /token|secret|password|api_key|credential|client_secret|private|customer|顧客|社内|実名|email|mail/i;

const POLICY_FILES = new Set([
  "README.md",
  "docs/public-safety.md",
  "TODO_public_review.md",
  "config/risk_policy.json",
]);

function listTextFiles(scanPath: string): string[] {
  const absolutePath = path.join(ROOT, scanPath);
  if (!fs.existsSync(absolutePath)) {
    return [];
  }

  const stat = fs.statSync(absolutePath);
  if (stat.isFile()) {
    return [scanPath];
  }

  const entries = fs.readdirSync(absolutePath, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const relativePath = path.join(scanPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...listTextFiles(relativePath));
    } else if (entry.isFile() && /\.(md|json|txt)$/i.test(entry.name)) {
      files.push(relativePath);
    }
  }

  return files.sort();
}

function isAllowedPolicyHit(file: string, text: string): { allowed: boolean; reason: string } {
  const lower = text.toLowerCase();

  if (POLICY_FILES.has(file)) {
    return { allowed: true, reason: "policy or checklist text" };
  }

  if (
    lower.includes("do not include") ||
    lower.includes("must not be included") ||
    lower.includes("public-safety") ||
    lower.includes("safety constraint") ||
    lower.includes("restricted values") ||
    lower.includes("personal information")
  ) {
    return { allowed: true, reason: "safety instruction text" };
  }

  return { allowed: false, reason: "requires manual review outside policy/checklist text" };
}

export function scanPublicFiles(): SafetyHit[] {
  const files = SCAN_ROOTS.flatMap(listTextFiles);
  const hits: SafetyHit[] = [];

  for (const file of files) {
    const lines = fs.readFileSync(path.join(ROOT, file), "utf8").split(/\r?\n/);
    lines.forEach((text, index) => {
      const match = text.match(RISK_PATTERN);
      if (!match) {
        return;
      }

      const decision = isAllowedPolicyHit(file, text);
      hits.push({
        file,
        line: index + 1,
        text,
        term: match[0],
        allowed: decision.allowed,
        reason: decision.reason,
      });
    });
  }

  return hits;
}

export function printSafetyScan(hits: SafetyHit[]): void {
  console.log("Public-safety term scan");
  console.log(`targets: ${SCAN_ROOTS.join(", ")}`);

  if (hits.length === 0) {
    console.log("PASS no risky terms found");
    return;
  }

  const disallowed = hits.filter((hit) => !hit.allowed);
  if (disallowed.length > 0) {
    console.log("FAIL risky terms require review outside policy/checklist text");
    for (const hit of disallowed) {
      console.log(`${hit.file}:${hit.line}: ${hit.text}`);
      console.log(`  term=${hit.term} reason=${hit.reason}`);
    }
    return;
  }

  console.log("PASS risky terms are limited to policy/checklist text");
  console.log("Manual review still required for these hits:");
  for (const hit of hits) {
    console.log(`${hit.file}:${hit.line}: ${hit.text}`);
    console.log(`  term=${hit.term} reason=${hit.reason}`);
  }
}

export function main(): number {
  const hits = scanPublicFiles();
  printSafetyScan(hits);
  return hits.some((hit) => !hit.allowed) ? 1 : 0;
}

if (require.main === module) {
  process.exitCode = main();
}
