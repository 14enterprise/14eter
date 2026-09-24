import { NextResponse } from "next/server";

const CONTACT_TO = process.env.CONTACT_TO ?? "+2349115963439";

function toWhatsAppNumber(number: string): string {
  return number.replace(/\D/g, "");
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | { name?: string; email?: string; message?: string; phone?: string }
    | null;

  const name = body?.name?.trim() ?? "";
  const email = body?.email?.trim() ?? "";
  const message = body?.message?.trim() ?? "";
  const phoneParam = body?.phone?.trim() ?? "";

  if (!name || !email || !message || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const phoneNumber = toWhatsAppNumber(phoneParam || CONTACT_TO);
  const text = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;

  return NextResponse.json({ ok: true, whatsappUrl });
}
