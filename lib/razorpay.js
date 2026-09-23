import Razorpay from "razorpay";
import crypto from "node:crypto";

let instance = null;

function getKeyId() {
  return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
}

function getKeySecret() {
  return process.env.RAZORPAY_KEY_SECRET;
}

export function getRazorpay() {
  if (instance) return instance;

  const key_id = getKeyId();
  const key_secret = getKeySecret();

  if (!key_id || !key_secret) {
    throw new Error(
      "Razorpay is not configured. Set NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local (Razorpay Dashboard → Settings → API Keys) — checkout cannot create a real order without both."
    );
  }

  instance = new Razorpay({ key_id, key_secret });
  return instance;
}

export function verifyPaymentSignature({ orderId, paymentId, signature }) {
  const key_secret = getKeySecret();
  if (!key_secret) {
    throw new Error(
      "Razorpay is not configured. Set RAZORPAY_KEY_SECRET in .env.local — payments cannot be verified without it."
    );
  }

  const expected = crypto
    .createHmac("sha256", key_secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return expected === signature;
}
