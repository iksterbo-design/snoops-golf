import "server-only";
import fs from "fs";
import path from "path";
import { env } from "./env";

/**
 * Video storage abstraction.
 * - local (default / demo): files under ./uploads/<swingId>/video.<ext>
 * - firebase: Firebase Storage bucket (requires env + rules)
 */
const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export async function saveVideo(swingId: string, file: File): Promise<{ path: string; size: number }> {
  if (env.firebase.enabled && env.storageDriver === "firebase" && env.firebase.storageBucket) {
    const admin = require("firebase-admin");
    if (!admin.apps.length) {
      admin.initializeApp({ credential: admin.credential.cert({
        projectId: env.firebase.projectId, clientEmail: env.firebase.clientEmail, privateKey: env.firebase.privateKey,
      }) });
    }
    const bucket = admin.storage().bucket();
    const ext = (file.name.split(".").pop() || "mp4").toLowerCase();
    const dest = `swings/${swingId}/video.${ext}`;
    const buf = Buffer.from(await file.arrayBuffer());
    await bucket.file(dest).save(buf, { metadata: { contentType: file.type || "video/mp4" } });
    return { path: dest, size: buf.length };
  }
  // local driver
  const dir = path.join(UPLOAD_DIR, swingId);
  fs.mkdirSync(dir, { recursive: true });
  const ext = (file.name.split(".").pop() || "mp4").toLowerCase();
  const dest = path.join(dir, `video.${ext}`);
  fs.writeFileSync(dest, Buffer.from(await file.arrayBuffer()));
  return { path: `local:swings/${swingId}/video.${ext}`, size: file.size };
}

export async function deleteVideo(storagePath: string | null): Promise<void> {
  if (!storagePath) return;
  if (storagePath.startsWith("local:")) {
    const rel = storagePath.slice("local:".length);
    const dir = path.join(UPLOAD_DIR, rel.split("/")[1] ?? "");
    if (dir.startsWith(UPLOAD_DIR)) fs.rmSync(dir, { recursive: true, force: true });
  } else if (env.firebase.enabled) {
    const admin = require("firebase-admin");
    const bucket = admin.storage().bucket();
    await bucket.file(storagePath).delete().catch(() => undefined);
  }
}

/** Serve a local video for playback in demo mode. */
export function readLocalVideo(storagePath: string): { dir: string } | null {
  if (!storagePath.startsWith("local:")) return null;
  const rel = storagePath.slice("local:".length);
  const swingId = rel.split("/")[1];
  const dir = path.join(UPLOAD_DIR, swingId);
  if (!dir.startsWith(UPLOAD_DIR) || !fs.existsSync(dir)) return null;
  const file = fs.readdirSync(dir).find(f => f.startsWith("video."));
  return file ? { dir } : null;
}
