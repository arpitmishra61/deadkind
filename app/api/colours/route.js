import { NextResponse } from "next/server";
import { getColours } from "@/lib/data/lookups";

export async function GET() {
  try {
    const colours = await getColours();
    return NextResponse.json({ colours });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
