import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/adminAuth";
import { getAdminDb, isFirebaseAdminConfigured } from "@/lib/firebaseAdmin";
import { serializeDoc } from "@/lib/data/serialize";
import { MOCK_PRODUCTS } from "@/lib/mockData";

export async function GET(request) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ products: MOCK_PRODUCTS, _mockData: true });
  }

  try {
    const db = getAdminDb();
    const snap = await db.collection("products").orderBy("createdAt", "desc").get();
    const products = snap.docs.map(serializeDoc);
    return NextResponse.json({ products });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ error: "Firebase not configured — add service account credentials to .env.local" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const {
      name, price, comparePrice, description, material, fit, weight,
      categoryId, subcategoryId, hero, isArchived,
      colours, sizes, images, stock,
    } = body;

    if (!name || !price || !categoryId || !subcategoryId) {
      return NextResponse.json({ error: "name, price, categoryId, subcategoryId are required" }, { status: 400 });
    }

    const db = getAdminDb();
    const docRef = await db.collection("products").add({
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
      colourImages: {},
      stock: stock || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const doc = await docRef.get();
    const product = serializeDoc(doc);
    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
