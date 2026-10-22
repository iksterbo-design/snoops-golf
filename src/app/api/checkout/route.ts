import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createCheckout } from "@/lib/payments";

export async function POST() {
  try {
    const user = await requireUser();
    const result = await createCheckout(user.id);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unauthorized." }, { status: e?.status ?? 401 });
  }
}
