import { NextResponse } from "next/server";
import { createAndSetSessionCookie, signInWithEmailPassword } from "@/lib/auth";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  try {
    const result = await signInWithEmailPassword(email, password);
    await createAndSetSessionCookie(result.idToken);
    return NextResponse.json({ ok: true, email });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
