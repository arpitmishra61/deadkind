import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { ADMIN_COOKIE } from "@/lib/adminAuth";

function getToken(password) {
  return createHash("sha256").update(password + "dk-admin-2050").digest("hex");
}

export async function POST(request) {
  const { password } = await request.json().catch(() => ({}));
  if (!password) return NextResponse.json({ error: "Password required" }, { status: 400 });

  const correct = process.env.ADMIN_PASSWORD || "password@123";
  if (password !== correct) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = getToken(correct);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 86400,
    path: "/",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(ADMIN_COOKIE);
  return res;
}
