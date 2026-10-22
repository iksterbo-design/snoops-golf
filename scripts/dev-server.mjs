#!/usr/bin/env node
/**
 * Cross-platform dev launcher.
 *
 * Why this exists: the README says `npm run dev`, but port 3000 is frequently
 * already taken (another dev server, a local tool, a previous run). Next then
 * either blocks on an interactive prompt or fails outright. This script:
 *
 *   1. picks the first free port from 3000 upward,
 *   2. binds 0.0.0.0 so a phone on the same Wi-Fi can reach the app,
 *   3. prints the localhost and LAN URLs before starting.
 *
 * Usage:  npm run dev            (auto port)
 *         PORT=4300 npm run dev  (start the search at 4300)
 */
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HOST = "0.0.0.0";
const PREFERRED = Number(process.env.PORT || 3000);
const MAX_TRIES = 40;

/**
 * True when nothing is listening on `port`.
 *
 * Probes the loopback address, not just `0.0.0.0`. Windows lets a socket bind
 * 0.0.0.0:PORT even when 127.0.0.1:PORT is already taken, so a wildcard-only
 * check reports a busy port as free and the dev server ends up shadowed by
 * whatever already owns loopback.
 */
function isFree(port) {
  return new Promise((resolve) => {
    const srv = createServer();
    srv.unref();
    srv.once("error", () => resolve(false));
    srv.once("listening", () => srv.close(() => resolve(true)));
    srv.listen(port, "127.0.0.1");
  });
}

async function firstFreePort(start) {
  for (let p = start; p < start + MAX_TRIES; p++) {
    if (await isFree(p)) return p;
  }
  throw new Error(`No free port between ${start} and ${start + MAX_TRIES - 1}.`);
}

/** Best-effort LAN IPv4, for the "open this on your phone" hint. */
function lanAddress() {
  try {
    const out = execFileSync("ipconfig", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    const m = out.match(/Wireless LAN adapter[^:]*:[\s\S]*?IPv4[^:]*:\s*(\d+\.\d+\.\d+\.\d+)/i);
    if (m) return m[1];
    const any = out.match(/IPv4[^:]*:\s*(\d+\.\d+\.\d+\.\d+)/);
    return any ? any[1] : null;
  } catch {
    return null;
  }
}

const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
if (!existsSync(nextBin)) {
  console.error("next is not installed. Run `npm install` first.");
  process.exit(1);
}

const port = await firstFreePort(PREFERRED);
const lan = lanAddress();

console.log("");
console.log("  AI Golf Coach — dev server");
console.log("  ----------------------------------------");
console.log(`  local :  http://localhost:${port}`);
if (lan) console.log(`  phone :  http://${lan}:${port}   (same Wi-Fi)`);
console.log("");
if (port !== PREFERRED) {
  console.log(`  note: port ${PREFERRED} was busy — using ${port} instead.`);
  console.log("");
}

const child = spawn(process.execPath, [nextBin, "dev", "-p", String(port), "-H", HOST], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, PORT: String(port) },
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 0);
});

for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, () => {
    child.kill(sig);
    setTimeout(() => process.exit(0), 300).unref();
  });
}
