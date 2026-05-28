import * as fs from "node:fs";
import * as path from "node:path";

const ROOT = process.cwd();
const LATEST_DIR = "artifacts/latest";

export function ensureArtifactDirs(): void {
  fs.mkdirSync(path.join(ROOT, LATEST_DIR), { recursive: true });
}

export function writeJsonArtifact(fileName: string, value: unknown): string {
  ensureArtifactDirs();
  const relativePath = path.join(LATEST_DIR, fileName);
  fs.writeFileSync(path.join(ROOT, relativePath), `${JSON.stringify(value, null, 2)}\n`, "utf8");
  return relativePath;
}

export function writeTextArtifact(fileName: string, value: string): string {
  ensureArtifactDirs();
  const relativePath = path.join(LATEST_DIR, fileName);
  fs.writeFileSync(path.join(ROOT, relativePath), value, "utf8");
  return relativePath;
}
