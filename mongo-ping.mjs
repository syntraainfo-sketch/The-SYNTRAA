#!/usr/bin/env node
/**
 * From repo root: `node mongo-ping.mjs`, `.\mongo-ping.cmd`, `npm run mongo-ping-cli`, or `npm run mongo-ping`.
 * Bare `mongo:ping` in PowerShell is invalid (npm script, not an .exe; `:` illegal in Windows filenames).
 */
import { spawnSync } from "node:child_process";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const cmd = "npm run mongo-ping-cli";
const result = spawnSync(cmd, {
  cwd: root,
  stdio: "inherit",
  shell: true,
});
process.exit(result.status ?? 1);
