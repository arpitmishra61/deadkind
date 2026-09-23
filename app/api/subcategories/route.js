import { NextResponse } from "next/server";
import { getSubcategories } from "@/lib/data/subcategories";

export async function GET(request) {
  const categoryId = new URL(request.url).searchParams.get("categoryId");
  try {
    const subcategories = await getSubcategories(categoryId);
    return NextResponse.json({ subcategories });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
