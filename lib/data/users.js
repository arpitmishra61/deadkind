import { getAdminDb } from "../firebaseAdmin";

export async function createUserProfile(uid, { email, phone }) {
  const db = getAdminDb();
  await db.collection("users").doc(uid).set({
    uid,
    email,
    phone: phone ? `+91${phone}` : null,
    createdAt: Date.now(),
  });
}

export async function getUserProfile(uid) {
  const db = getAdminDb();
  const doc = await db.collection("users").doc(uid).get();
  return doc.exists ? doc.data() : null;
}
