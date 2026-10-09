import { NextResponse } from "next/server";
import { getProductById } from "@/lib/data/products";
import { attachRazorpayOrderId, createPendingOrder } from "@/lib/data/orders";
import { getRazorpay } from "@/lib/razorpay";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { items, customer, shipping, paymentMethod, notes, gstin, upiId } = body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
  }
  if (!customer?.firstName || !customer?.lastName || !customer?.email || !customer?.phone) {
    return NextResponse.json({ error: "Missing required customer details." }, { status: 400 });
  }
  if (!shipping?.address1 || !shipping?.city || !shipping?.state || !shipping?.pincode) {
    return NextResponse.json({ error: "Missing required shipping details." }, { status: 400 });
  }

  // Re-validate every line against live product data — the server never
  // trusts client-supplied price or stock (the original flow did).
  const validatedItems = [];
  for (const item of items) {
    let product;
    try {
      product = await getProductById(item.id);
    } catch (err) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    if (!product) {
      return NextResponse.json({ error: `Product "${item.name || item.id}" no longer exists.` }, { status: 400 });
    }
    const stockKey = `${item.colour}_${item.size}`;
    const available = product.stock?.[stockKey] || 0;
    if (available < item.qty) {
      return NextResponse.json({ error: `Only ${available} of "${product.name}" left in stock.` }, { status: 400 });
    }
    validatedItems.push({
      id: product.id,
      name: product.name,
      collection: item.collection || "",
      price: product.price,
      qty: item.qty,
      size: item.size || "",
      sizeName: item.sizeName || "",
      colour: item.colour || "",
      colourName: item.colourName || "",
      colourHex: item.colourHex || "",
      images: item.images || [],
      lineTotal: product.price * item.qty,
    });
  }

  const subtotal = validatedItems.reduce((s, i) => s + i.lineTotal, 0);
  const pricing = { subtotal, shipping: 0, discount: 0, total: subtotal, currency: "INR" };

  let firestoreOrderId;
  let orderId;
  try {
    const created = await createPendingOrder({
      items: validatedItems,
      customer: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        fullName: `${customer.firstName} ${customer.lastName}`,
        email: customer.email,
        phone: `+91${customer.phone}`,
      },
      shipping: { ...shipping, country: "India" },
      pricing,
      paymentMethod: paymentMethod || "upi",
      notes,
      gstin,
    });
    firestoreOrderId = created.firestoreOrderId;
    orderId = created.orderId;
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  try {
    const razorpay = getRazorpay();
    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(subtotal * 100),
      currency: "INR",
      receipt: orderId,
      notes: { firestoreOrderId, orderId },
    });
    await attachRazorpayOrderId(firestoreOrderId, rzpOrder.id);

    return NextResponse.json({
      firestoreOrderId,
      orderId,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.log("Error creating Razorpay order:", err);
    return NextResponse.json({ error: err.message, firestoreOrderId, orderId }, { status: 500 });
  }
}
