import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "agc_session";

/**
 * Edge guard: presence check only. Real authorization (signature + role) is
 * enforced server-side in /admin pages, API routes, and Firestore rules —
 * hidden navigation is never the only protection.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/admin")) {
    const hasSession = Boolean(req.cookies.get(SESSION_COOKIE)?.value);
    if (!hasSession) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
