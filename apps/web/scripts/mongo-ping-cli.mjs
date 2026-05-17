#!/usr/bin/env node
/**
 * From repo root: `node apps/web/scripts/mongo-ping-cli.mjs` or `npm run mongo-ping-cli`.
 * Bare `mongo:ping` in PowerShell is not a command (use npm run / node as above).
 */
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const r = spawnSync("npm", ["run", "mongo:ping"], {
  cwd: webRoot,
  stdio: "inherit",
  shell: true,
});
process.exit(r.status ?? 1);
