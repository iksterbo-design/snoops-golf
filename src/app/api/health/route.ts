import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Liveness/readiness probe for containers, load balancers and uptime checks. */
export async function GET() {
  return NextResponse.json(
    { status: "ok", uptime: process.uptime() },
    { status: 200 },
  );
}
