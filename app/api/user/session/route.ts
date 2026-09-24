import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { USER_COOKIE, verifyUserToken } from "@/lib/user-auth";
import { findUserByEmail } from "@/lib/users-db";

export async function GET() {
  const store = await cookies();
  const session = await verifyUserToken(store.get(USER_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const user = await findUserByEmail(session.email);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }
  return NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      company: user.company,
      projectName: user.projectName,
      projectType: user.projectType,
      projectDescription: user.projectDescription,
      model: user.model,
      status: user.status,
      createdAt: user.createdAt,
    },
  });
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(USER_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}