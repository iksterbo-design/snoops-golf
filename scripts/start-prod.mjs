#!/usr/bin/env node
/**
 * Production launcher with auto-restart.
 * Runs `next start -H 0.0.0.0 -p 3000` and restarts it if it exits or crashes.
 * Usage: node scripts/start-prod.mjs
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HOST = "0.0.0.0";
const PORT = Number(process.env.PORT || 3000);
const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");

function start() {
  console.log(`[prod] starting next start on ${HOST}:${PORT}`);
  const child = spawn(process.execPath, [nextBin, "start", "-H", HOST, "-p", String(PORT)], {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, PORT: String(PORT), NODE_ENV: "production" },
  });
  child.on("exit", (code, signal) => {
    console.log(`[prod] exited code=${code} signal=${signal}; restarting in 2s...`);
    setTimeout(start, 2000);
  });
  child.on("error", (err) => {
    console.error("[prod] spawn error:", err);
    setTimeout(start, 2000);
  });
}

// graceful shutdown
for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, () => {
    console.log(`[prod] received ${sig}, shutting down`);
    process.exit(0);
  });
}

start();
