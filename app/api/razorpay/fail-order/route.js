import { markOrderFailed } from "@/lib/data/orders";

export async function POST(request) {
  try {
    const { firestoreOrderId, reason } = await request.json();
    if (!firestoreOrderId) {
      return Response.json({ error: "Missing firestoreOrderId" }, { status: 400 });
    }
    await markOrderFailed(firestoreOrderId, reason || "payment_failed_client");
    return Response.json({ ok: true });
  } catch (err) {
    console.error("fail-order error:", err);
    return Response.json({ error: "Failed to update order" }, { status: 500 });
  }
}
