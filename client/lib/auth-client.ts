"use client";

export type UserRole = "CUSTOMER" | "WORKER";

export interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  role: string;
}

const TOKEN_COOKIE = "wh_token";
const USER_COOKIE = "wh_user";
const SEVEN_DAYS_SECONDS = 60 * 60 * 24 * 7;

function setCookie(name: string, value: string) {
  const encoded = encodeURIComponent(value);
  document.cookie = `${name}=${encoded}; path=/; max-age=${SEVEN_DAYS_SECONDS}; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

export function saveSession(token: string, user: SessionUser) {
  setCookie(TOKEN_COOKIE, token);
  setCookie(USER_COOKIE, JSON.stringify(user));
  cachedRaw = JSON.stringify(user);
  cachedUser = user;
  listeners.forEach((listener) => listener());
}

export function getToken(): string | null {
  return getCookie(TOKEN_COOKIE);
}

export function getUser(): SessionUser | null {
  const raw = getCookie(USER_COOKIE);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

// Cached snapshot + subscription for useSyncExternalStore consumers
let cachedRaw: string | null | undefined;
let cachedUser: SessionUser | null = null;
const listeners: Array<() => void> = [];

export function getSessionSnapshot(): SessionUser | null {
  const raw = getCookie(USER_COOKIE);
  if (cachedRaw === undefined || raw !== cachedRaw) {
    cachedRaw = raw;
    cachedUser = getUser();
  }
  return cachedUser;
}

export function subscribeToSession(listener: () => void): () => void {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index !== -1) listeners.splice(index, 1);
  };
}

export function clearSession() {
  deleteCookie(TOKEN_COOKIE);
  deleteCookie(USER_COOKIE);
  cachedRaw = undefined;
  cachedUser = null;
  listeners.forEach((listener) => listener());
}

export function dashboardPathForRole(role?: string | null): string {
  return role === "WORKER" ? "/worker/dashboard" : "/";
}

/**
 * Where a brand-new account lands right after signup + email verification.
 * Workers go through skills onboarding first; customers go straight to the
 * marketplace.
 */
export function signupRedirectPath(role?: string | null): string {
  return role === "WORKER" ? "/worker/onboarding/skills" : "/";
}

/**
 * Resolve where a login should land. The account's real role always wins, so a
 * Worker never lands on a customer page and vice-versa. An optional `redirect`
 * (e.g. from middleware) is only honoured when it matches the role's own area.
 */
export function resolveLoginRedirect(
  role: string | null | undefined,
  redirect?: string | null
): string {
  if (redirect && redirect.startsWith("/") && !redirect.startsWith("/api")) {
    const wantsWorkerArea = redirect.startsWith("/worker");
    if (role === "WORKER" && wantsWorkerArea) return redirect;
    if (role !== "WORKER" && !wantsWorkerArea) return redirect;
  }
  return dashboardPathForRole(role);
}

export function isWorkerRole(user?: SessionUser | null): boolean {
  return user?.role === "WORKER";
}

export function isCustomerRole(user?: SessionUser | null): boolean {
  return user?.role === "CUSTOMER";
}
