import { NextResponse } from "next/server";
import { listActiveCoaches } from "@/lib/coaches/data";

export async function GET() {
  const coaches = listActiveCoaches().map(c => ({ ...c, preferredDrills: undefined, systemPrompt: undefined }));
  return NextResponse.json({ coaches, demoMode: process.env.NEXT_PUBLIC_DEMO_MODE !== "false" });
}
