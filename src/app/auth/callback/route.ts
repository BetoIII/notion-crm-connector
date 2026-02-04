/**
 * OAuth callback route
 * Handles the redirect from Notion after user authorization
 */

import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken } from "@/lib/auth/oauth";
import { setSession } from "@/lib/auth/session";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // Handle authorization errors
  if (error) {
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/?error=missing_parameters", request.url)
    );
  }

  // Verify CSRF state
  const cookieStore = await cookies();
  const savedState = cookieStore.get("oauth_state")?.value;

  if (!savedState || savedState !== state) {
    return NextResponse.redirect(new URL("/?error=invalid_state", request.url));
  }

  // Clear the state cookie
  cookieStore.delete("oauth_state");

  try {
    // Exchange code for token
    const tokenResponse = await exchangeCodeForToken(code);

    // Store session
    const now = Math.floor(Date.now() / 1000);
    await setSession({
      access_token: tokenResponse.access_token,
      refresh_token: tokenResponse.refresh_token,
      workspace_id: tokenResponse.workspace_id,
      workspace_name: tokenResponse.workspace_name,
      bot_id: tokenResponse.bot_id,
      expires_at: now + 3600, // 1 hour
    });

    // Redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/?error=authentication_failed", request.url)
    );
  }
}
