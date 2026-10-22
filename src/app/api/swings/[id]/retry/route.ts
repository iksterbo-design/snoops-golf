import { NextResponse } from "next/server";
import { getStore } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { completeSwing } from "@/lib/analysis/complete";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const store = getStore();
    const swing = await store.getSwing(params.id);
    if (!swing || (!user.isAdmin && swing.userId !== user.id)) return NextResponse.json({ error: "Not found." }, { status: 404 });
    await store.updateSwing(params.id, { status: "processing", error: null });
    completeSwing(params.id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unauthorized." }, { status: e?.status ?? 401 });
  }
}
