import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

interface JwtPayload {
  userId?: string;
  email?: string;
  role?: string;
  exp?: number;
}

// Lightweight JWT payload decoder for Next.js Edge Middleware route gating
async function decodeJwtPayload(
  token: string
): Promise<JwtPayload | null> {
  try {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET is not configured");
    }

    const secretKey = new TextEncoder().encode(secret);

    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });

    return payload as JwtPayload;
  } catch {
    // Invalid signature, malformed token, or expired token
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("wh_token")?.value;
  const payload = token ? await decodeJwtPayload(token) : null;
  const { pathname } = request.nextUrl;

  // 1. HOME ROUTE: /
  // If user is already logged in, redirect them to their respective dashboard.
  // The home route / is reserved for first-time visitors / guests.
  if (pathname === "/") {
    if (payload?.role === "CUSTOMER") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
    if (payload?.role === "WORKER") {
      const url = request.nextUrl.clone();
      url.pathname = "/worker/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // 2. WORKER PROTECTED ROUTES: /worker and /worker/*
  if (pathname.startsWith("/worker")) {
    // Unauthenticated: redirect to login as WORKER
    if (!payload) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.search = `?role=WORKER&redirect=${encodeURIComponent(pathname)}`;
      return NextResponse.redirect(url);
    }

    // Customer role trying to access worker portal
    if (payload.role !== "WORKER") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      url.search = "?error=unauthorized_worker_access";
      return NextResponse.redirect(url);
    }
  }

  // 3. CUSTOMER PROTECTED ROUTES: /dashboard, /book/* and /bookings/*
  if (
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname.startsWith("/book") ||
    pathname.startsWith("/bookings")
  ) {
    // Unauthenticated: redirect to login as CUSTOMER
    if (!payload) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.search = `?role=CUSTOMER&redirect=${encodeURIComponent(pathname)}`;
      return NextResponse.redirect(url);
    }

    // Worker role trying to access customer dashboard or booking pages
    if (payload.role === "WORKER") {
      const url = request.nextUrl.clone();
      url.pathname = "/worker/dashboard";
      url.search = "?error=workers_cannot_book";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard",
    "/dashboard/:path*",
    "/worker",
    "/worker/:path*",
    "/book/:path*",
    "/bookings/:path*",
  ],
};
