import * as fs from "node:fs";
import * as path from "node:path";

export type RiskLevel = "low" | "medium" | "high" | "blocked";

export type RiskPolicy = {
  policyName: string;
  blockedThreshold: number;
  highThreshold: number;
  mediumThreshold: number;
  categories: Array<{
    name: string;
    weight: number;
    terms: string[];
  }>;
};

export type RiskScoreResult = {
  level: RiskLevel;
  score: number;
  findings: Array<{
    category: string;
    term: string;
    weight: number;
  }>;
};

const ROOT = process.cwd();
const DEFAULT_POLICY_PATH = "config/risk_policy.json";

export function loadRiskPolicy(policyPath = DEFAULT_POLICY_PATH): RiskPolicy {
  return JSON.parse(fs.readFileSync(path.join(ROOT, policyPath), "utf8")) as RiskPolicy;
}

function normalize(input: string): string {
  return input.toLowerCase();
}

function includesTerm(input: string, term: string): boolean {
  return normalize(input).includes(normalize(term));
}

export function scoreText(input: string, policy: RiskPolicy = loadRiskPolicy()): RiskScoreResult {
  const findings: RiskScoreResult["findings"] = [];
  const matched = new Set<string>();

  for (const category of policy.categories) {
    for (const term of category.terms) {
      const key = `${category.name}:${term}`;
      if (!matched.has(key) && includesTerm(input, term)) {
        matched.add(key);
        findings.push({
          category: category.name,
          term,
          weight: category.weight,
        });
      }
    }
  }

  const score = findings.reduce((total, finding) => total + finding.weight, 0);
  let level: RiskLevel = "low";
  if (score >= policy.blockedThreshold) {
    level = "blocked";
  } else if (score >= policy.highThreshold) {
    level = "high";
  } else if (score >= policy.mediumThreshold) {
    level = "medium";
  }

  return { level, score, findings };
}

export function scoreObject(value: unknown, policy: RiskPolicy = loadRiskPolicy()): RiskScoreResult {
  return scoreText(JSON.stringify(value), policy);
}

export function main(): number {
  const target = process.argv[2];
  const policy = loadRiskPolicy();
  const input = target && fs.existsSync(path.join(ROOT, target))
    ? fs.readFileSync(path.join(ROOT, target), "utf8")
    : target ?? "";
  const result = scoreText(input, policy);
  console.log(JSON.stringify(result, null, 2));
  return result.level === "blocked" ? 1 : 0;
}

if (require.main === module) {
  process.exitCode = main();
}
