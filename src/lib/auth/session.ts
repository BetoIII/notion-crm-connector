/**
 * Session management with JWE encrypted cookies
 * Uses jose library for compact JWE encryption
 */

import { jwtDecrypt, SignJWT, EncryptJWT } from "jose";
import { cookies } from "next/headers";
import { refreshAccessToken } from "./oauth";

const COOKIE_NAME = "notion_session";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

export interface SessionPayload {
  access_token: string;
  refresh_token?: string;
  workspace_id: string;
  workspace_name?: string;
  bot_id: string;
  expires_at: number; // Unix timestamp
}

/**
 * Get the encryption key from environment
 */
function getEncryptionKey(): Uint8Array {
  const secret = process.env.ENCRYPTION_SECRET;
  if (!secret) {
    throw new Error("ENCRYPTION_SECRET environment variable is not set");
  }
  // Convert hex string to Uint8Array
  return new Uint8Array(Buffer.from(secret, "hex"));
}

/**
 * Encrypt session payload to JWE
 */
export async function encryptSession(
  payload: SessionPayload
): Promise<string> {
  const key = getEncryptionKey();

  return await new EncryptJWT({ ...payload })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .encrypt(key);
}

/**
 * Decrypt JWE to session payload
 */
export async function decryptSession(
  token: string
): Promise<SessionPayload | null> {
  try {
    const key = getEncryptionKey();
    const { payload } = await jwtDecrypt(token, key);
    return payload as unknown as SessionPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Get current session from cookie, refresh if needed
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);

  if (!sessionCookie) {
    return null;
  }

  let session = await decryptSession(sessionCookie.value);
  if (!session) {
    return null;
  }

  // Check if token is nearing expiry (< 1 hour remaining)
  const now = Math.floor(Date.now() / 1000);
  const oneHourFromNow = now + 3600;

  if (session.expires_at < oneHourFromNow && session.refresh_token) {
    try {
      // Refresh the token
      const tokenResponse = await refreshAccessToken(session.refresh_token);

      // Update session
      session = {
        ...session,
        access_token: tokenResponse.access_token,
        refresh_token: tokenResponse.refresh_token || session.refresh_token,
        expires_at: now + 3600, // Notion tokens typically last 1 hour
      };

      // Update cookie
      const newToken = await encryptSession(session);
      cookieStore.set(COOKIE_NAME, newToken, COOKIE_OPTIONS);
    } catch (error) {
      console.error("Failed to refresh token:", error);
      // Return session anyway, let the API call fail and handle it there
    }
  }

  return session;
}

/**
 * Set session cookie
 */
export async function setSession(payload: SessionPayload): Promise<void> {
  const token = await encryptSession(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, COOKIE_OPTIONS);
}

/**
 * Clear session cookie
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
