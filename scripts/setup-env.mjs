#!/usr/bin/env node
/**
 * Cross-platform environment bootstrap: creates .env.local from .env.example
 * on Windows, macOS and Linux without relying on `cp` (which cmd.exe/PowerShell
 * have no `cp`). An existing .env.local is never overwritten.
 */
import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const src = join(root, ".env.example");
const dest = join(root, ".env.local");

if (existsSync(dest)) {
  console.log(".env.local already exists - leaving it untouched.");
} else if (existsSync(src)) {
  copyFileSync(src, dest);
  console.log("Created .env.local from .env.example");
  console.log("Open it and fill in only the services you want to use.");
} else {
  console.error("Missing .env.example - cannot create .env.local");
  process.exit(1);
}
