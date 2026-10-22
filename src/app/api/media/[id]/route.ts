import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getStore } from "@/lib/db";
import { requireUser } from "@/lib/auth";

/** Streams a locally-stored demo video. Firebase mode would redirect to a signed URL. */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const store = getStore();
    const swing = await store.getSwing(params.id);
    if (!swing || (!user.isAdmin && swing.userId !== user.id)) return new NextResponse("Not found", { status: 404 });
    if (!swing.videoPath?.startsWith("local:")) return NextResponse.json({ error: "Video not available locally." }, { status: 404 });

    const dir = path.join(process.cwd(), "uploads", params.id);
    if (!dir.startsWith(path.join(process.cwd(), "uploads")) || !fs.existsSync(dir)) return new NextResponse("Not found", { status: 404 });
    const file = fs.readdirSync(dir).find(f => f.startsWith("video."));
    if (!file) return new NextResponse("Not found", { status: 404 });
    const buf = fs.readFileSync(path.join(dir, file));
    return new NextResponse(new Uint8Array(buf), {
      headers: { "Content-Type": "video/mp4", "Cache-Control": "private, max-age=3600" },
    });
  } catch (e: any) {
    return new NextResponse(e?.message ?? "Unauthorized", { status: e?.status ?? 401 });
  }
}
