import { NextResponse } from "next/server";
import { getCategories } from "@/lib/data/categories";

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json({ categories });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
