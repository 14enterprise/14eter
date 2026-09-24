import { NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/users-db";
import { verifyPassword, USER_COOKIE, userToken } from "@/lib/user-auth";
import { PARTNER_COOKIE, partnerToken } from "@/lib/partner-token";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | { email?: string; password?: string }
    | null;

  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: "Email and password required." }, { status: 400 });
  }

  const user = await findUserByEmail(body.email);
  if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const isPartner = user.model !== "diy";
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const cookieName = isPartner ? PARTNER_COOKIE : USER_COOKIE;
  const token = await (isPartner
    ? partnerToken(user.email, exp)
    : userToken(user.email, exp));

  const res = NextResponse.json({
    ok: true,
    name: user.name,
    redirect: isPartner ? "/dashboard" : "/user-dashboard",
  });
  const isHttps =
    req.headers.get("x-forwarded-proto") === "https" ||
    new URL(req.url).protocol === "https:";
  res.cookies.set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
    secure: isHttps,
  });
  return res;
}