import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb, isFirebaseAdminConfigured } from "../firebaseAdmin";
import { warnMockData } from "../mockData";

export async function submitContactMessage({ name, email, subject, message, userAgent }) {
  if (!isFirebaseAdminConfigured()) {
    warnMockData("contact submit (message was NOT saved anywhere)");
    return;
  }

  const db = getAdminDb();
  await db.collection("contact").add({
    name,
    email,
    subject: subject || "—",
    message,
    userAgent: userAgent || "",
    status: "new",
    timestamp: FieldValue.serverTimestamp(),
  });
}
