import { NextRequest, NextResponse } from "next/server";
import { USER_COOKIE, verifyUserToken } from "@/lib/user-auth";
import { findUserByEmail, getUserSubscriptionStatus } from "@/lib/users-db";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await verifyUserToken(req.cookies.get(USER_COOKIE)?.value ?? null);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await findUserByEmail(session.email);
  if (!user || user.model === "partner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscription = await getUserSubscriptionStatus(user.id);
  return NextResponse.json(subscription);
}