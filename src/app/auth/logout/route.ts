/**
 * Logout route
 * Clears the session cookie and redirects to home
 */

import { NextRequest, NextResponse } from "next/server";
import { clearSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  await clearSession();
  return NextResponse.json({ success: true });
}

export async function GET(request: NextRequest) {
  await clearSession();
  return NextResponse.redirect(new URL("/", request.url));
}
