/**
 * Next.js middleware for route protection
 * Checks for valid session on protected routes
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("notion_session");
  const { pathname } = request.nextUrl;

  // For internal integration (dev mode), skip session checks
  // When using OAuth (production), uncomment the protection below

  /*
  // Protect /dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!sessionCookie) {
      // No session, redirect to home
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Redirect authenticated users away from home page
  if (pathname === "/" && sessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  */

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/"],
};
