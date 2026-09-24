import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { isAdminRequest } from "@/lib/admin-auth";
import { dbReady, getDb, sections } from "@/lib/db";

const PARTNER_KEYS = ["name", "tag", "website", "color", "logo"];

export async function POST(req: Request) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as
    | { id?: number; partners?: unknown }
    | null;

  if (!body?.id || !Array.isArray(body.partners)) {
    return NextResponse.json(
      { error: "Invalid payload. Provide a section id and partners array." },
      { status: 400 }
    );
  }

  await dbReady();
  const db = getDb();
  const rows = await db.select().from(sections).where(eq(sections.id, body.id));
  if (!rows[0]) {
    return NextResponse.json({ error: "Section not found." }, { status: 404 });
  }

  const partners = body.partners.map((p) => {
    const rec = (p && typeof p === "object" ? p : {}) as Record<string, unknown>;
    const out: Record<string, string> = {};
    for (const key of PARTNER_KEYS) {
      out[key] = String(rec[key] ?? "").trim();
    }
    return out;
  });

  let content: Record<string, unknown> = {};
  try {
    content = JSON.parse(rows[0].content);
  } catch {}

  await db
    .update(sections)
    .set({
      content: JSON.stringify({ ...content, partners }),
      updatedAt: Date.now(),
    })
    .where(eq(sections.id, body.id));

  return NextResponse.json({ ok: true, count: partners.length });
}