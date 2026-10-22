import "server-only";
import { execFile } from "child_process";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import type { Analysis, Swing } from "@/types";
import { localVideoFile } from "@/lib/storage";

const execFileAsync = promisify(execFile);

const FFMPEG = process.env.FFMPEG_PATH || "ffmpeg";
const FFPROBE = process.env.FFPROBE_PATH || "ffprobe";

let availableCache: boolean | null = null;

/** True when an ffmpeg binary is reachable. Cached for the process lifetime. */
export async function ffmpegAvailable(): Promise<boolean> {
  if (availableCache !== null) return availableCache;
  try {
    await execFileAsync(FFMPEG, ["-version"], { timeout: 8000 });
    availableCache = true;
  } catch {
    availableCache = false;
  }
  return availableCache;
}

/**
 * Probe the real duration of a video (seconds) when ffprobe/ffmpeg exist.
 * Returns null when ffmpeg is unavailable or the file cannot be read — callers
 * must fall back to a client-reported duration.
 */
export async function probeDuration(videoPath: string): Promise<number | null> {
  try {
    const { stdout } = await execFileAsync(
      FFPROBE,
      ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", videoPath],
      { timeout: 20000 },
    );
    const d = parseFloat(stdout.trim());
    if (Number.isFinite(d) && d > 0) return Math.round(d * 10) / 10;
  } catch {
    /* fall through to ffmpeg parsing */
  }
  try {
    const { stderr } = await execFileAsync(FFMPEG, ["-i", videoPath], { timeout: 20000 });
    const m = stderr.match(/Duration:\s*(\d+):(\d+):([\d.]+)/);
    if (m) return Math.round((Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3])) * 10) / 10;
  } catch {
    /* ffmpeg unavailable */
  }
  return null;
}

/** "0:12" | "12" -> seconds */
export function toSec(t: string): number {
  const parts = t.split(":").map(Number);
  return parts.length === 2 ? parts[0] * 60 + parts[1] : Number(t) || 0;
}

/**
 * Extract one JPEG per requested timestamp into uploads/<swingId>/frames/.
 * Best-effort: any failure simply leaves that checkpoint without a frame.
 * Returns a map of timestamp (seconds) -> public URL for the frame.
 */
export async function extractFrames(
  videoPath: string,
  swingId: string,
  timestamps: number[],
): Promise<Map<number, string>> {
  const frames = new Map<number, string>();
  const unique = [...new Set(timestamps.filter(t => t > 0))];
  if (!unique.length || !(await ffmpegAvailable())) return frames;

  const dir = path.join(process.cwd(), "uploads", swingId, "frames");
  fs.mkdirSync(dir, { recursive: true });

  await Promise.all(
    unique.map(async (t, i) => {
      const name = `frame-${String(i + 1).padStart(2, "0")}.jpg`;
      const out = path.join(dir, name);
      try {
        await execFileAsync(
          FFMPEG,
          ["-y", "-ss", t.toFixed(2), "-i", videoPath, "-frames:v", "1", "-vf", "scale=480:-2", "-q:v", "4", out],
          { timeout: 45000 },
        );
        if (fs.existsSync(out) && fs.statSync(out).size > 0) {
          frames.set(t, `/api/media/${swingId}?frame=${i + 1}`);
        }
      } catch {
        /* optional enrichment: skip this frame */
      }
    }),
  );
  return frames;
}

/**
 * Enrich a completed analysis with real extracted frames for each video
 * checkpoint. Runs only when ffmpeg is installed and the video is stored
 * locally; otherwise the analysis is returned untouched.
 */
export async function attachCheckpointFrames(swing: Swing, analysis: Analysis): Promise<Analysis> {
  try {
    const videoPath = localVideoFile(swing.videoPath);
    if (!videoPath || !(await ffmpegAvailable())) return analysis;
    const times = analysis.observations.map(o => toSec(o.checkpoint.t));
    if (!times.some(t => t > 0)) return analysis;
    // Keep every checkpoint inside the actual clip so frames always resolve.
    const duration = Math.max(0.5, swing.durationSec || 0);
    const clamped = times.map(t => Math.max(0.1, Math.min(t, duration - 0.15)));
    const frames = await extractFrames(videoPath, swing.id, clamped);
    if (!frames.size) return analysis;
    const byIndex = new Map(clamped.map((t, i) => [i, frames.get(t)]));
    analysis.observations = analysis.observations.map((o, i) => {
      const frame = byIndex.get(i);
      return frame ? { ...o, checkpoint: { ...o.checkpoint, frame } } : o;
    });
  } catch {
    /* enrichment is optional — never fail the analysis */
  }
  return analysis;
}

/** Used by the demo seed / admin tooling to build a contact sheet (optional). */
export async function hasMediaTooling(): Promise<{ ffmpeg: boolean; ffprobe: boolean }> {
  const ffmpeg = await ffmpegAvailable();
  let ffprobe = false;
  try {
    await execFileAsync(FFPROBE, ["-version"], { timeout: 8000 });
    ffprobe = true;
  } catch {
    ffprobe = false;
  }
  return { ffmpeg, ffprobe };
}
