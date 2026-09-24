import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { updateUserStatus } from "@/lib/users-db";

const ALLOWED = ["pending", "approved", "in_progress", "completed"];

export async function POST(req: Request) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as
    | { id?: number; status?: string }
    | null;

  if (!body?.id || !body.status || !ALLOWED.includes(body.status)) {
    return NextResponse.json(
      { error: "Invalid id or status." },
      { status: 400 }
    );
  }

  await updateUserStatus(body.id, body.status);

  return NextResponse.json({ ok: true });
}