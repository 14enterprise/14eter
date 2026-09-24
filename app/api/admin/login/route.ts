import { NextResponse } from "next/server";
import { ADMIN_COOKIE, expectedToken } from "@/lib/admin-auth";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { password?: string } | null;

  if (!body?.password || body.password !== (process.env.ADMIN_PASSWORD ?? "admin123")) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  const isHttps =
    req.headers.get("x-forwarded-proto") === "https" ||
    new URL(req.url).protocol === "https:";
  res.cookies.set(ADMIN_COOKIE, await expectedToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: isHttps,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
