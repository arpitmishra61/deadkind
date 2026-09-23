import { NextResponse } from "next/server";
import { getProductById, getRelatedProducts } from "@/lib/data/products";

export async function GET(_request, { params }) {
  const { id } = await params;
  try {
    const product = await getProductById(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }
    const related = await getRelatedProducts(product);
    return NextResponse.json({ products: related });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
