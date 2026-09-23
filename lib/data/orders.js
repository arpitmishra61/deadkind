import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "../firebaseAdmin";
import { serializeDoc } from "./serialize";

function genOrderId() {
  return `DK-${Date.now().toString(36).toUpperCase().slice(-6)}${Math.random().toString(36).slice(-3).toUpperCase()}`;
}

// Creates exactly one order document, in 'pending' state, before the Razorpay
// order/modal exist. verify-payment is the ONLY place that ever moves this
// document to 'paid' — there is no second, independent write path, which is
// what closes the "payment succeeds but Firestore write fails" / "Firestore
// write succeeds but no payment happened" split seen in the original flow.
export async function createPendingOrder({ items, customer, shipping, pricing, paymentMethod, notes, gstin }) {
  const db = getAdminDb();
  const orderId = genOrderId();
  const ref = db.collection("orders").doc();

  await ref.set({
    orderId,
    customer,
    shipping,
    items,
    pricing,
    paymentMethod: paymentMethod || "razorpay",
    notes: notes || "",
    gstin: gstin || "",
    status: "pending",
    paymentStatus: "pending",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return { firestoreOrderId: ref.id, orderId };
}

export async function attachRazorpayOrderId(firestoreOrderId, razorpayOrderId) {
  const db = getAdminDb();
  await db.collection("orders").doc(firestoreOrderId).update({
    "razorpay.orderId": razorpayOrderId,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function getOrderById(id) {
  const db = getAdminDb();
  const doc = await db.collection("orders").doc(id).get();
  if (!doc.exists) return null;
  return serializeDoc(doc);
}

// Runs the HMAC-verified success path: marks the order paid and decrements
// stock atomically in one transaction, re-checking stock at write time
// (the original never re-checked — it just blind-decremented).
export async function finalizeOrderPayment({ firestoreOrderId, paymentId, razorpayOrderId, signature }) {
  const db = getAdminDb();
  const orderRef = db.collection("orders").doc(firestoreOrderId);

  return db.runTransaction(async (tx) => {
    const orderSnap = await tx.get(orderRef);
    if (!orderSnap.exists) throw new Error("Order not found.");

    const order = orderSnap.data();
    if (order.paymentStatus === "captured") {
      return { alreadyCaptured: true };
    }

    const items = order.items || [];
    const productRefs = items.map((item) => db.collection("products").doc(item.id));
    const productSnaps = await Promise.all(productRefs.map((ref) => tx.get(ref)));

    items.forEach((item, i) => {
      const snap = productSnaps[i];
      if (!snap.exists) return;
      const stockKey = `${item.colour}_${item.size}`;
      const currentStock = snap.data()?.stock?.[stockKey];
      if (typeof currentStock === "number" && currentStock < item.qty) {
        throw new Error(`Insufficient stock for "${item.name}".`);
      }
    });

    tx.update(orderRef, {
      status: "paid",
      paymentStatus: "captured",
      razorpay: { paymentId, orderId: razorpayOrderId, signature },
      updatedAt: FieldValue.serverTimestamp(),
    });

    items.forEach((item, i) => {
      if (!productSnaps[i].exists) return;
      const stockKey = `${item.colour}_${item.size}`;
      tx.update(productRefs[i], { [`stock.${stockKey}`]: FieldValue.increment(-item.qty) });
    });

    return { alreadyCaptured: false };
  });
}

export async function markOrderFailed(firestoreOrderId, reason) {
  const db = getAdminDb();
  await db.collection("orders").doc(firestoreOrderId).update({
    status: "payment_failed",
    paymentStatus: "failed",
    failureReason: reason || null,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function getOrdersForUser({ email, phone }) {
  const db = getAdminDb();
  const results = new Map();

  if (email) {
    const snap = await db.collection("orders").where("customer.email", "==", email).get();
    snap.docs.forEach((doc) => results.set(doc.id, serializeDoc(doc)));
  }
  if (phone) {
    const snap = await db.collection("orders").where("customer.phone", "==", phone).get();
    snap.docs.forEach((doc) => results.set(doc.id, serializeDoc(doc)));
  }

  return Array.from(results.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}
