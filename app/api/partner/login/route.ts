import { NextResponse } from "next/server";
import { PARTNER_COOKIE, partnerToken } from "@/lib/partner-token";
import { findUserByEmail } from "@/lib/users-db";
import { verifyPassword } from "@/lib/user-auth";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | { email?: string; password?: string }
    | null;

  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const user = await findUserByEmail(body.email);
  if (!user) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  if (user.model !== "partner") {
    return NextResponse.json(
      { error: "This account is registered with the AI App Factory — use Client Login instead." },
      { status: 401 }
    );
  }

  if (!(await verifyPassword(body.password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const res = NextResponse.json({ ok: true, name: user.name });
  const isHttps =
    req.headers.get("x-forwarded-proto") === "https" ||
    new URL(req.url).protocol === "https:";
  res.cookies.set(PARTNER_COOKIE, await partnerToken(user.email, exp), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
    secure: isHttps,
  });
  return res;
}