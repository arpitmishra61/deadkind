import { cookies } from "next/headers";
import { getAdminAuth } from "./firebaseAdmin";

const SESSION_COOKIE_NAME = "__session";
const SESSION_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000; // 14 days
const IDENTITY_TOOLKIT_BASE = "https://identitytoolkit.googleapis.com/v1";

function getWebApiKey() {
  const key = process.env.FIREBASE_WEB_API_KEY;
  if (!key) {
    throw new Error(
      "Missing FIREBASE_WEB_API_KEY. Add it to .env.local (Firebase Console -> Project Settings -> General -> Web API Key) — sign-in cannot work without it."
    );
  }
  return key;
}

// Server-side calls to Google's Identity Toolkit REST API. This is what lets
// the browser do email/password auth via our own /api/auth/* routes without
// ever loading the Firebase client SDK.
async function identityToolkitRequest(endpoint, body) {
  const key = getWebApiKey();
  const res = await fetch(`${IDENTITY_TOOLKIT_BASE}/accounts:${endpoint}?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || "Authentication request failed.");
  }
  return data;
}

export function signUpWithEmailPassword(email, password) {
  return identityToolkitRequest("signUp", { email, password, returnSecureToken: true });
}

export function signInWithEmailPassword(email, password) {
  return identityToolkitRequest("signInWithPassword", { email, password, returnSecureToken: true });
}

export function sendResetPasswordEmail(email) {
  return identityToolkitRequest("sendOobCode", { requestType: "PASSWORD_RESET", email });
}

export async function createAndSetSessionCookie(idToken) {
  const auth = getAdminAuth();
  const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn: SESSION_MAX_AGE_MS });
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE_MS / 1000,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
}

export async function getCurrentUser() {
  const store = await cookies();
  const sessionCookie = store.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;

  try {
    const auth = getAdminAuth();
    const decoded = await auth.verifySessionCookie(sessionCookie, true);
    return { uid: decoded.uid, email: decoded.email };
  } catch {
    return null;
  }
}
