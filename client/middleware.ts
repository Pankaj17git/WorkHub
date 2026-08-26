import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Lightweight JWT payload decoder for route gating.
// Signature verification happens server-side via the API routes.
function decodeJwtPayload(token: string): { role?: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("wh_token")?.value;
  const payload = token ? decodeJwtPayload(token) : null;

  // Worker portal requires an authenticated WORKER session
  if (!payload || payload.role !== "WORKER") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "?role=WORKER";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/worker", "/worker/:path*"],
};
