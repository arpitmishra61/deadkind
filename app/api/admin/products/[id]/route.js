import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/adminAuth";
import { getAdminDb, isFirebaseAdminConfigured } from "@/lib/firebaseAdmin";
import { serializeDoc } from "@/lib/data/serialize";

export async function PUT(request, { params }) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });
  }

  const { id } = await params;
  try {
    const body = await request.json();
    const {
      name, price, comparePrice, description, material, fit, weight,
      categoryId, subcategoryId, hero, isArchived,
      colours, sizes, images, stock,
    } = body;

    const db = getAdminDb();
    const ref = db.collection("products").doc(id);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    await ref.update({
      name: String(name),
      price: Number(price),
      comparePrice: comparePrice ? Number(comparePrice) : null,
      description: description || "",
      material: material || "",
      fit: fit || "",
      weight: weight || "",
      categoryId,
      subcategoryId,
      hero: Boolean(hero),
      isArchived: Boolean(isArchived),
      colours: colours || [],
      sizes: sizes || [],
      images: images || [],
      stock: stock || {},
      updatedAt: new Date(),
    });

    const updated = await ref.get();
    const product = serializeDoc(updated);
    return NextResponse.json({ product });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });
  }

  const { id } = await params;
  try {
    const db = getAdminDb();
    await db.collection("products").doc(id).delete();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
