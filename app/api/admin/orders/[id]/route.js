import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/adminAuth";
import { getAdminDb, isFirebaseAdminConfigured } from "@/lib/firebaseAdmin";
import { serializeDoc } from "@/lib/data/serialize";
import { sendMail } from "@/lib/mailer";
import { orderStatusEmail } from "@/lib/emailTemplates";

const VALID_STATUSES = ["pending", "paid", "confirmed", "shipped", "delivered", "payment_failed"];
const EMAIL_STATUSES = new Set(["confirmed", "shipped", "delivered"]);

export async function PATCH(request, { params }) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });
  }

  const { id } = await params;
  const { status } = await request.json().catch(() => ({}));

  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` }, { status: 400 });
  }

  try {
    const db = getAdminDb();
    const ref = db.collection("orders").doc(id);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const timestampField = { confirmed: "confirmedAt", shipped: "shippedAt", delivered: "deliveredAt" }[status];
    const update = { status, updatedAt: new Date() };
    if (timestampField) update[timestampField] = new Date();

    await ref.update(update);

    const updated = await ref.get();
    const data = updated.data();

    if (EMAIL_STATUSES.has(status)) {
      try {
        const order = serializeDoc(updated);
        const email = order?.customer?.email;
        if (email) {
          const mailPayload = orderStatusEmail(order, status);
          if (mailPayload) {
            await sendMail({ to: email, subject: mailPayload.subject, html: mailPayload.html });
          }
        }
      } catch (mailErr) {
        console.error("[mailer] status email failed:", mailErr);
      }
    }

    return NextResponse.json({
      status: data.status,
      confirmedAt: data.confirmedAt?.toDate?.()?.toISOString() ?? data.confirmedAt ?? null,
      shippedAt:   data.shippedAt?.toDate?.()?.toISOString()   ?? data.shippedAt   ?? null,
      deliveredAt: data.deliveredAt?.toDate?.()?.toISOString()  ?? data.deliveredAt  ?? null,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
