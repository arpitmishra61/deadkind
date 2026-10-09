import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/adminAuth";
import { getAdminDb, isFirebaseAdminConfigured } from "@/lib/firebaseAdmin";
import { MOCK_COLOURS } from "@/lib/mockData";

export async function GET(request) {
  if (!verifyAdminRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isFirebaseAdminConfigured()) return NextResponse.json({ colours: MOCK_COLOURS, _mockData: true });

  const db = getAdminDb();
  const snap = await db.collection("colours").orderBy("name").get();
  const colours = {};
  snap.docs.forEach((d) => { colours[d.id] = { name: d.data().name, hex: d.data().hex }; });
  return NextResponse.json({ colours });
}

export async function POST(request) {
  if (!verifyAdminRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isFirebaseAdminConfigured()) return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });

  const { name, hex } = await request.json().catch(() => ({}));
  if (!name?.trim() || !hex) return NextResponse.json({ error: "name and hex are required" }, { status: 400 });

  const id = "colour-" + name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const db = getAdminDb();
  await db.collection("colours").doc(id).set({ name: name.trim(), hex });
  return NextResponse.json({ id, colour: { name: name.trim(), hex } }, { status: 201 });
}

export async function DELETE(request) {
  if (!verifyAdminRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isFirebaseAdminConfigured()) return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const db = getAdminDb();

  // Remove this colour from every product that references it
  const affected = await db.collection("products").where("colours", "array-contains", id).get();
  const batch = db.batch();
  affected.docs.forEach((doc) => {
    const data = doc.data();
    const colours = (data.colours || []).filter((c) => c !== id);
    const stock = Object.fromEntries(
      Object.entries(data.stock || {}).filter(([k]) => !k.startsWith(`${id}_`))
    );
    const colourImages = Object.fromEntries(
      Object.entries(data.colourImages || {}).filter(([k]) => k !== id)
    );
    batch.update(doc.ref, { colours, stock, colourImages });
  });
  if (!affected.empty) await batch.commit();

  await db.collection("colours").doc(id).delete();
  return NextResponse.json({ ok: true });
}
