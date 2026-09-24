import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { deleteUserApp, findUserById } from "@/lib/users-db";

export async function POST(req: Request) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { id?: number } | null;

  if (!body?.id || typeof body.id !== "number") {
    return NextResponse.json({ error: "Invalid user id." }, { status: 400 });
  }

  const user = await findUserById(body.id);
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  await deleteUserApp(user.id);

  return NextResponse.json({ ok: true });
}