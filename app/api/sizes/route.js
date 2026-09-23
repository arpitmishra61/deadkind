import { NextResponse } from "next/server";
import { getSizes } from "@/lib/data/lookups";

export async function GET() {
  try {
    const sizes = await getSizes();
    return NextResponse.json({ sizes });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
