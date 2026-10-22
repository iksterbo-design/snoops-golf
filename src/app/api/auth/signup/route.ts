import { NextResponse } from "next/server";
import { registerUser, setSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name } = body ?? {};
    if (typeof email !== "string" || !email.includes("@")) return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    if (typeof password !== "string" || password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    const user = await registerUser(email, password, typeof name === "string" ? name : "");
    setSessionCookie(user.id);
    return NextResponse.json({ user });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Signup failed." }, { status: 400 });
  }
}
