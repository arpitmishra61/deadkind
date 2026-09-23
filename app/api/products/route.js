import { NextResponse } from "next/server";
import { getAllProducts } from "@/lib/data/products";

export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const subcategoryId = params.get("subcategoryId") || undefined;
  const categoryId = params.get("categoryId") || undefined;

  try {
    const products = await getAllProducts({ subcategoryId, categoryId });
    return NextResponse.json({ products });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
