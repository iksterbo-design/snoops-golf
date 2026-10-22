import { NextResponse } from "next/server";
import { getCoach } from "@/lib/coaches/data";
import { getStore } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const coach = getCoach(params.id);
  if (!coach) return NextResponse.json({ error: "Coach not found." }, { status: 404 });
  return NextResponse.json({ coach });
}

/** Admin: update a coach's prompt template and/or extra drills. */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const coach = getCoach(params.id);
    if (!coach) return NextResponse.json({ error: "Coach not found." }, { status: 404 });
    const body = await req.json();
    const store = getStore();
    const existing = (await store.getCoachOverrides())[params.id] ?? {};
    await store.saveCoachOverride(params.id, {
      systemPrompt: typeof body.systemPrompt === "string" ? body.systemPrompt : existing.systemPrompt,
      drills: Array.isArray(body.drills) ? body.drills : existing.drills,
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Update failed." }, { status: e?.status ?? 400 });
  }
}
