import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify, SignJWT } from "jose";

import { db } from "@/lib/db";

const SESSION_COOKIE = "exc_session";
const encoder = new TextEncoder();
const secret = encoder.encode(
  process.env.SESSION_SECRET ?? "replace-this-session-secret-before-production"
);

export type SessionPayload = {
  userId: string;
  role: "ADMIN" | "SUPER_ADMIN";
  email: string;
  name: string;
};

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function requireSession() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const admin = await db.adminUser.findUnique({
    where: { id: session.userId }
  });

  if (!admin) {
    await clearSession();
    redirect("/login");
  }

  return session;
}

export async function requireSuperAdmin() {
  const session = await requireSession();

  if (session.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  return session;
}
