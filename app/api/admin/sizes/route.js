import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/adminAuth";
import { getAdminDb, isFirebaseAdminConfigured } from "@/lib/firebaseAdmin";
import { MOCK_SIZES } from "@/lib/mockData";

export async function GET(request) {
  if (!verifyAdminRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isFirebaseAdminConfigured()) return NextResponse.json({ sizes: MOCK_SIZES, _mockData: true });

  const db = getAdminDb();
  const snap = await db.collection("sizes").get();
  const sizes = {};
  snap.docs.forEach((d) => { sizes[d.id] = d.data().name; });
  return NextResponse.json({ sizes });
}

export async function POST(request) {
  if (!verifyAdminRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isFirebaseAdminConfigured()) return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });

  const { name } = await request.json().catch(() => ({}));
  if (!name?.trim()) return NextResponse.json({ error: "name is required" }, { status: 400 });

  const id = "size-" + name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const db = getAdminDb();
  await db.collection("sizes").doc(id).set({ name: name.trim() });
  return NextResponse.json({ id, name: name.trim() }, { status: 201 });
}

export async function DELETE(request) {
  if (!verifyAdminRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isFirebaseAdminConfigured()) return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const db = getAdminDb();
  await db.collection("sizes").doc(id).delete();
  return NextResponse.json({ ok: true });
}
