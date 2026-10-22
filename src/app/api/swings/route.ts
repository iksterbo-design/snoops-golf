import { NextResponse } from "next/server";
import { getStore } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { uid } from "@/lib/utils";
import type { Swing } from "@/types";

export async function GET() {
  try {
    const user = await requireUser();
    const store = getStore();
    const swings = user.isAdmin ? await store.listAllSwings() : await store.listSwingsByUser(user.id);
    return NextResponse.json({ swings });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unauthorized." }, { status: e?.status ?? 401 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const { coachId, input } = body ?? {};
    if (!coachId || !input?.club) return NextResponse.json({ error: "coachId and swing input are required." }, { status: 400 });
    const swing: Swing = {
      id: uid("swg"), userId: user.id, coachId: String(coachId),
      input: {
        club: String(input.club),
        skillLevel: ["beginner","intermediate","advanced"].includes(input.skillLevel) ? input.skillLevel : "intermediate",
        goal: String(input.goal ?? ""), context: String(input.context ?? ""),
        issues: Array.isArray(input.issues) ? input.issues.map(String) : [],
      },
      videoPath: null, videoName: null, durationSec: 0,
      status: "processing", analysis: null, paymentId: null,
      mode: process.env.NEXT_PUBLIC_DEMO_MODE === "false" ? "live" : "demo",
      error: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    const store = getStore();
    await store.createSwing(swing);
    return NextResponse.json({ swing });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unauthorized." }, { status: e?.status ?? 401 });
  }
}
