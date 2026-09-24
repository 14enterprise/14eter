import { NextResponse } from "next/server";
import { USER_COOKIE, userToken, verifyPassword } from "@/lib/user-auth";
import { findUserByEmail } from "@/lib/users-db";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | { email?: string; password?: string }
    | null;

  const email = body?.email?.trim().toLowerCase();
  const password = body?.password;

  if (!email || !password) {
    return NextResponse.json({ error: "Missing email or password." }, { status: 400 });
  }

  const user = await findUserByEmail(email);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 }
    );
  }

  if (user.model === "partner") {
    return NextResponse.json(
      { error: "This account is registered as Partner With Us — use Partner Login instead." },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ ok: true, name: user.name });
  const isHttps =
    req.headers.get("x-forwarded-proto") === "https" ||
    new URL(req.url).protocol === "https:";
  res.cookies.set(USER_COOKIE, await userToken(user.email, Date.now() + 7 * 24 * 60 * 60 * 1000), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: isHttps,
  });
  return res;
}