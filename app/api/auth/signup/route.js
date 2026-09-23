import { NextResponse } from "next/server";
import { createAndSetSessionCookie, signUpWithEmailPassword } from "@/lib/auth";
import { createUserProfile } from "@/lib/data/users";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { email, password, phone } = body;

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }
  if (!/^\d{10}$/.test(phone || "")) {
    return NextResponse.json({ error: "Enter a valid 10-digit mobile number." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  try {
    const result = await signUpWithEmailPassword(email, password);
    await createUserProfile(result.localId, { email, phone });
    await createAndSetSessionCookie(result.idToken);
    return NextResponse.json({ ok: true, email });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
