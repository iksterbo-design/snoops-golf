import { NextResponse } from "next/server";
import { getStore } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const store = getStore();
    const payments = await store.listPayments();
    return NextResponse.json({ payments });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Forbidden." }, { status: e?.status ?? 403 });
  }
}
