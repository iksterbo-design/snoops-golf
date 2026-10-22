import { NextResponse } from "next/server";
import { loginUser, setSessionCookie, resetAdminIfRequested } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body ?? {};
    // Ensure the bootstrap admin exists (first run creates it).
    await resetAdminIfRequested();
    const user = await loginUser(String(email ?? ""), String(password ?? ""));
    setSessionCookie(user.id);
    return NextResponse.json({ user });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Login failed." }, { status: 401 });
  }
}
