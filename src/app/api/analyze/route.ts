import { NextResponse } from "next/server";
import { getStore } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { completeSwing } from "@/lib/analysis/complete";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const { swingId } = await req.json();
    const store = getStore();
    const swing = await store.getSwing(String(swingId ?? ""));
    if (!swing || (!user.isAdmin && swing.userId !== user.id)) return NextResponse.json({ error: "Not found." }, { status: 404 });
    await store.updateSwing(swing.id, { status: "processing", error: null });
    completeSwing(swing.id);
    return NextResponse.json({ ok: true, status: "processing" });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unauthorized." }, { status: e?.status ?? 401 });
  }
}
