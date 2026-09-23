import { NextResponse } from "next/server";
import { getProductById } from "@/lib/data/products";

export async function GET(_request, { params }) {
  const { id } = await params;
  try {
    const product = await getProductById(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
