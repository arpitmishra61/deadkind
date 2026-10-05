import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/adminAuth";
import { getAdminDb, isFirebaseAdminConfigured } from "@/lib/firebaseAdmin";
import { MOCK_CATEGORIES } from "@/lib/mockData";

export async function GET(request) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ categories: MOCK_CATEGORIES, _mockData: true });
  }

  try {
    const db = getAdminDb();
    const snap = await db.collection("categories").orderBy("name").get();
    const categories = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ categories });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });
  }

  const { name } = await request.json().catch(() => ({}));
  if (!name?.trim()) return NextResponse.json({ error: "name is required" }, { status: 400 });

  try {
    const db = getAdminDb();
    const ref = await db.collection("categories").add({ name: name.trim() });
    const doc = await ref.get();
    return NextResponse.json({ category: { id: doc.id, ...doc.data() } }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  try {
    const db = getAdminDb();
    await db.collection("categories").doc(id).delete();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
