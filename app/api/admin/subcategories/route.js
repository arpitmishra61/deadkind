import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/adminAuth";
import { getAdminDb, isFirebaseAdminConfigured } from "@/lib/firebaseAdmin";
import { MOCK_SUBCATEGORIES } from "@/lib/mockData";

export async function GET(request) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ subcategories: MOCK_SUBCATEGORIES, _mockData: true });
  }

  try {
    const db = getAdminDb();
    const url = new URL(request.url);
    const categoryId = url.searchParams.get("categoryId");

    let query = db.collection("subcategories").orderBy("name");
    if (categoryId) query = query.where("categoryId", "==", categoryId);

    const snap = await query.get();
    const subcategories = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ subcategories });
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

  const { name, categoryId } = await request.json().catch(() => ({}));
  if (!name?.trim() || !categoryId) {
    return NextResponse.json({ error: "name and categoryId are required" }, { status: 400 });
  }

  try {
    const db = getAdminDb();
    const ref = await db.collection("subcategories").add({ name: name.trim(), categoryId });
    const doc = await ref.get();
    return NextResponse.json({ subcategory: { id: doc.id, ...doc.data() } }, { status: 201 });
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
    await db.collection("subcategories").doc(id).delete();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
