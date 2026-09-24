import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PARTNER_COOKIE, verifyPartnerToken } from "@/lib/partner-token";
import { findUserByEmail } from "@/lib/users-db";

export async function GET() {
  const store = await cookies();
  const session = await verifyPartnerToken(store.get(PARTNER_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const user = await findUserByEmail(session.email);
  if (!user) {
    return NextResponse.json({ error: "Partner not found" }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    email: user.email,
    name: user.name,
    model: user.model,
    status: user.status,
    projectName: user.projectName,
  });
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(PARTNER_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}