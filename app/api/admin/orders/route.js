import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/adminAuth";
import { getAdminDb, isFirebaseAdminConfigured } from "@/lib/firebaseAdmin";
import { serializeDoc } from "@/lib/data/serialize";

export async function GET(request) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ orders: [], _mockData: true });
  }

  try {
    const db = getAdminDb();
    const snap = await db.collection("orders").orderBy("createdAt", "desc").get();
    const orders = snap.docs.map(serializeDoc);
    return NextResponse.json({ orders });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
