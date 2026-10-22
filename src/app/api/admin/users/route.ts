import { NextResponse } from "next/server";
import { getStore } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const store = getStore();
    const users = await store.listUsers();
    return NextResponse.json({ users });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Forbidden." }, { status: e?.status ?? 403 });
  }
}
