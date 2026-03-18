import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const encoder = new TextEncoder();
const secret = encoder.encode(
  process.env.SESSION_SECRET ?? "replace-this-session-secret-before-production"
);

export async function middleware(request: NextRequest) {
  const session = request.cookies.get("exc_session")?.value;
  const isProtectedPath =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/events") ||
    request.nextUrl.pathname.startsWith("/students") ||
    request.nextUrl.pathname.startsWith("/admins");

  if (!isProtectedPath) {
    return NextResponse.next();
  }

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    await jwtVerify(session, secret);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/events/:path*", "/students/:path*", "/admins/:path*"]
};
