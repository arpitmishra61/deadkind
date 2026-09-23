import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable "${name}". Add it to .env.local (see .env.local.example for where to get it) — the app cannot talk to Firebase without it.`
    );
  }
  return value;
}

function getAdminApp() {
  const existing = getApps();
  if (existing.length) return existing[0];

  const projectId = requireEnv("FIREBASE_PROJECT_ID");
  const clientEmail = requireEnv("FIREBASE_CLIENT_EMAIL");
  const privateKey = requireEnv("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n");

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

// Used by lib/data/* to decide whether to serve local mock data instead of
// hitting Firestore — lets the UI render before real credentials exist.
export function isFirebaseAdminConfigured() {
  return Boolean(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY);
}
