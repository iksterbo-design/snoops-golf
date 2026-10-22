import "server-only";
import crypto from "crypto";
import { cookies } from "next/headers";
import { getStore, getCredentials, saveCredentials } from "./db";
import { env } from "./env";
import { uid } from "./utils";
import type { User } from "@/types";

export const SESSION_COOKIE = "agc_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const s = salt ?? crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, s, 64).toString("hex");
  return { hash, salt: s };
}

export function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  const { hash } = hashPassword(password, salt);
  const a = Buffer.from(hash, "hex"); const b = Buffer.from(expectedHash, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", env.appSecret).update(payload).digest("base64url");
}

export function makeSessionToken(userId: string): string {
  const exp = Date.now() + SESSION_TTL_MS;
  const payload = `${userId}.${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined | null): { userId: string } | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, exp, sig] = parts;
  if (sign(`${userId}.${exp}`) !== sig) return null;
  if (Number(exp) < Date.now()) return null;
  return { userId };
}

export interface SessionUser extends User { isAdmin: boolean }

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = getStore();
  // Prefer cookie session (works in both demo and firebase modes).
  const token = cookies().get(SESSION_COOKIE)?.value;
  const session = verifySessionToken(token);
  if (session) {
    const u = await store.getUserById(session.userId);
    if (u) return { ...u, isAdmin: u.role === "admin" };
  }
  return null;
}

export async function requireUser(): Promise<SessionUser> {
  const u = await getSessionUser();
  if (!u) throw new AuthError("unauthenticated");
  return u;
}
export async function requireAdmin(): Promise<SessionUser> {
  const u = await requireUser();
  if (!u.isAdmin) throw new AuthError("forbidden");
  return u;
}

export class AuthError extends Error {
  status: number;
  constructor(kind: "unauthenticated" | "forbidden") { super(kind); this.status = kind === "unauthenticated" ? 401 : 403; }
}

export async function registerUser(email: string, password: string, name: string): Promise<User> {
  const store = getStore();
  email = email.trim().toLowerCase();
  const existing = await store.getUserByEmail(email);
  if (existing) throw new Error("An account with this email already exists.");
  const id = uid("usr");
  const role = email === env.adminEmail ? "admin" : "golfer";
  const user: User = { id, email, name: name.trim() || email.split("@")[0], role, createdAt: new Date().toISOString() };
  await store.createUser(user);
  const { hash, salt } = hashPassword(password);
  await saveCredentials(id, hash, salt);
  return user;
}

export async function loginUser(email: string, password: string): Promise<User> {
  const store = getStore();
  email = email.trim().toLowerCase();
  const user = await store.getUserByEmail(email);
  if (!user) throw new Error("Invalid email or password.");
  const creds = await getCredentials(user.id);
  if (!creds || !verifyPassword(password, creds.salt, creds.hash)) throw new Error("Invalid email or password.");
  return user;
}

export function setSessionCookie(userId: string): void {
  cookies().set(SESSION_COOKIE, makeSessionToken(userId), {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: SESSION_TTL_MS / 1000,
    secure: env.appUrl.startsWith("https"),
  });
}

export function clearSessionCookie(): void {
  cookies().set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export async function resetAdminIfRequested(): Promise<void> {
  // Seeds the bootstrap admin on first login attempt if missing.
  const store = getStore();
  const existing = await store.getUserByEmail(env.adminEmail);
  if (!existing) {
    const u = await registerUser(env.adminEmail, env.adminPassword, "Head Admin");
    console.log(`[auth] bootstrap admin created: ${u.email} (role=${u.role})`);
  }
}
