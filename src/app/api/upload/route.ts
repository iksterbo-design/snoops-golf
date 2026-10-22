import { NextResponse } from "next/server";
import { getStore } from "@/lib/db";
import { saveVideo, localVideoFile } from "@/lib/storage";
import { probeDuration } from "@/lib/media/ffmpeg";
import { requireUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const swingId = new URL(req.url).searchParams.get("swingId");
    if (!swingId) return NextResponse.json({ error: "swingId is required." }, { status: 400 });
    const store = getStore();
    const swing = await store.getSwing(swingId);
    if (!swing || (!user.isAdmin && swing.userId !== user.id)) return NextResponse.json({ error: "Not found." }, { status: 404 });

    const form = await req.formData();
    const file = form.get("video");
    if (!(file instanceof File)) return NextResponse.json({ error: "No video file provided." }, { status: 400 });

    const { path, size } = await saveVideo(swingId, file);
    // Prefer the real container duration from ffmpeg; fall back to the client value.
    const probed = await probeDuration(localVideoFile(path) ?? "").catch(() => null);
    const durationSec = probed ?? (Number(form.get("duration")) || estimateDuration(size));
    await store.updateSwing(swingId, { videoPath: path, videoName: file.name, durationSec });
    return NextResponse.json({ ok: true, path, size, durationSec });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Upload failed." }, { status: 400 });
  }
}

function estimateDuration(sizeBytes: number): number {
  return Math.max(3, Math.min(60, Math.round(sizeBytes / (1024 * 1024 * 1.5))));
}
