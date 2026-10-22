import { NextResponse } from "next/server";
import { getStore } from "@/lib/db";
import { deleteVideo } from "@/lib/storage";
import { requireUser } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const store = getStore();
    const swing = await store.getSwing(params.id);
    if (!swing || (!user.isAdmin && swing.userId !== user.id)) return NextResponse.json({ error: "Not found." }, { status: 404 });

    if (swing.status === "processing" && Date.now() - new Date(swing.updatedAt).getTime() > 2500) {
      const { runAnalysis } = await import("@/lib/analysis/run");
      const analysis = await runAnalysis(swing.id);
      const updated = await store.updateSwing(swing.id, { status: "completed", analysis });
      return NextResponse.json({ swing: updated });
    }
    return NextResponse.json({ swing });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unauthorized." }, { status: e?.status ?? 401 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const store = getStore();
    const swing = await store.getSwing(params.id);
    if (!swing || (!user.isAdmin && swing.userId !== user.id)) return NextResponse.json({ error: "Not found." }, { status: 404 });
    await deleteVideo(swing.videoPath);
    await store.deleteSwing(params.id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unauthorized." }, { status: e?.status ?? 401 });
  }
}
