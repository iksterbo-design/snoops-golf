import { NextResponse } from "next/server";
import { hasMediaTooling } from "@/lib/media/ffmpeg";

export const dynamic = "force-dynamic";

/** Liveness/readiness probe for containers, load balancers and uptime checks. */
export async function GET() {
  const media = await hasMediaTooling().catch(() => ({ ffmpeg: false, ffprobe: false }));
  return NextResponse.json({
    ok: true,
    status: "healthy",
    demoMode: process.env.NEXT_PUBLIC_DEMO_MODE !== "false",
    media,
    time: new Date().toISOString(),
  });
}
