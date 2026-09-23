import { NextResponse } from "next/server";
import { sendResetPasswordEmail } from "@/lib/auth";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { email } = body;

  if (!email) {
    return NextResponse.json({ error: "Enter your email first." }, { status: 400 });
  }

  try {
    await sendResetPasswordEmail(email);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Could not send reset email." }, { status: 400 });
  }
}
