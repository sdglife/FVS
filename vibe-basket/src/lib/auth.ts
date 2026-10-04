import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "node:crypto";

/**
 * v1 admin auth (PRD §10 decision #4: single-creator, no org/team model).
 *
 * This is deliberately NOT Supabase Auth: there's exactly one admin, so a
 * signed session cookie checked against ADMIN_EMAIL/ADMIN_PASSWORD avoids
 * standing up email delivery for magic links just to authenticate one
 * person. Multi-tenant auth is Phase 3 (PRD §11) — swap this module out
 * when that lands, nothing else in the app depends on how auth works
 * internally.
 */

const COOKIE_NAME = "nfvc_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s) {
    throw new Error("AUTH_SECRET is not set (see .env.example).");
  }
  return s;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("hex");
}

export async function createAdminSession() {
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = `admin:${expires}`;
  const token = `${payload}.${sign(payload)}`;

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expires),
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return false;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  if (sign(payload) !== signature) return false;

  const [, expiresRaw] = payload.split(":");
  const expires = Number(expiresRaw);
  if (!Number.isFinite(expires) || Date.now() > expires) return false;

  return true;
}

/** Call at the top of any protected admin page/action; redirects if not signed in. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
}

export function verifyAdminCredentials(email: string, password: string): boolean {
  const expectedEmail = process.env.ADMIN_EMAIL;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedEmail || !expectedPassword) {
    throw new Error("ADMIN_EMAIL / ADMIN_PASSWORD are not set (see .env.example).");
  }
  // Constant-time-ish comparison; this gates one low-value internal tool,
  // not a bank, but there's no reason to use `===` on secrets either.
  return (
    timingSafeEqual(email.trim().toLowerCase(), expectedEmail.trim().toLowerCase()) &&
    timingSafeEqual(password, expectedPassword)
  );
}

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
