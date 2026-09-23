import { NextResponse } from "next/server";
import { submitContactMessage } from "@/lib/data/contact";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { name, email, subject, message, company } = body || {};

  // Honeypot: bots fill hidden fields humans never see. Pretend success so
  // they don't learn to avoid it, but never write anything.
  if (company) {
    return NextResponse.json({ ok: true });
  }

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  try {
    await submitContactMessage({
      name: name.trim(),
      email: email.trim(),
      subject: subject?.trim(),
      message: message.trim(),
      userAgent: request.headers.get("user-agent") || "",
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
