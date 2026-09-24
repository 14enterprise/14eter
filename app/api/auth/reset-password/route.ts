import { NextResponse } from "next/server";
import { consumePasswordReset, findUserByEmail, setUserPassword } from "@/lib/users-db";
import {
  hashPassword,
  hashResetToken,
  USER_COOKIE,
  userToken,
} from "@/lib/user-auth";
import { PARTNER_COOKIE, partnerToken } from "@/lib/partner-token";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | { token?: string; password?: string }
    | null;

  const token = body?.token?.trim();
  const password = body?.password;

  if (!token) {
    return NextResponse.json({ error: "Reset link is invalid." }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters long." },
      { status: 400 }
    );
  }

  const tokenHash = await hashResetToken(token);
  const reset = await consumePasswordReset(tokenHash);
  if (!reset) {
    return NextResponse.json(
      { error: "This reset link is invalid or has expired. Please request a new one." },
      { status: 400 }
    );
  }

  const user = await findUserByEmail(reset.email);
  if (!user) {
    return NextResponse.json(
      { error: "No account is linked to this reset request." },
      { status: 400 }
    );
  }

  const passwordHash = await hashPassword(password);
  await setUserPassword(user.id, passwordHash);

  const isPartner = user.model !== "diy";
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const cookieName = isPartner ? PARTNER_COOKIE : USER_COOKIE;
  const token2 = await (isPartner
    ? partnerToken(user.email, exp)
    : userToken(user.email, exp));

  const res = NextResponse.json({
    ok: true,
    redirect: isPartner ? "/dashboard" : "/user-dashboard",
  });
  const isHttps =
    req.headers.get("x-forwarded-proto") === "https" ||
    new URL(req.url).protocol === "https:";
  res.cookies.set(cookieName, token2, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
    secure: isHttps,
  });
  return res;
}