import { NextResponse } from "next/server";
import { finalizeOrderPayment, markOrderFailed } from "@/lib/data/orders";
import { verifyPaymentSignature } from "@/lib/razorpay";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { firestoreOrderId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = body || {};

  if (!firestoreOrderId || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return NextResponse.json({ error: "Missing payment verification fields." }, { status: 400 });
  }

  let signatureValid;
  try {
    signatureValid = verifyPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  if (!signatureValid) {
    try {
      await markOrderFailed(firestoreOrderId, "Signature verification failed.");
    } catch {
      // best-effort — the failed signature is the real reason to reject either way
    }
    return NextResponse.json({ error: "Payment signature verification failed." }, { status: 400 });
  }

  try {
    const result = await finalizeOrderPayment({
      firestoreOrderId,
      paymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      signature: razorpay_signature,
    });
    return NextResponse.json({ ok: true, alreadyCaptured: result.alreadyCaptured });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
