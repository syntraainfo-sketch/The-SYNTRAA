/**
 * Preloads `apps/web/.env.local` before `tsx` runs (`node --import ./scripts/load-env.mjs ...`).
 * Fixes ESM import hoisting where `import "./bootstrap-env"` may run after `env` is evaluated.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(scriptDir, "..");

const candidates = [
  resolve(webRoot, ".env.local"),
  resolve(webRoot, ".env"),
  resolve(process.cwd(), ".env.local"),
  resolve(process.cwd(), ".env"),
  resolve(process.cwd(), "apps", "web", ".env.local"),
  resolve(process.cwd(), "apps", "web", ".env"),
];

for (const filePath of candidates) {
  if (!existsSync(filePath)) continue;
  const src = readFileSync(filePath, "utf8");
  for (const line of src.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if (!key) continue;
    const existing = process.env[key];
    if (existing !== undefined && existing !== "") continue;
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
}
