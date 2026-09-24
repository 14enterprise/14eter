import { NextResponse } from "next/server";
import { asc, desc, eq } from "drizzle-orm";
import { isAdminRequest } from "@/lib/admin-auth";
import { dbReady, getDb, pages, sections, users } from "@/lib/db";

export async function GET(req: Request) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbReady();
  const db = getDb();

  const pageRows = await db.select().from(pages).orderBy(asc(pages.id));
  const sectionRows = await db.select().from(sections).orderBy(asc(sections.sort));
  const userRows = await db.select().from(users).orderBy(desc(users.createdAt));

  const data = pageRows.map((page) => ({
    id: page.id,
    slug: page.slug,
    title: page.title,
    sections: sectionRows
      .filter((s) => s.pageId === page.id)
      .map((s) => {
        let content: unknown = {};
        try {
          content = JSON.parse(s.content);
        } catch {}
        return {
          id: s.id,
          key: s.key,
          label: s.label,
          sort: s.sort,
          updatedAt: s.updatedAt,
          content,
        };
      }),
  }));

  return NextResponse.json({
    pages: data,
    partnerUsers: userRows
      .filter((u) => u.model === "partner")
      .map((u) => ({ email: u.email, name: u.name, status: u.status })),
    clients: userRows.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      company: u.company,
      projectName: u.projectName,
      projectType: u.projectType,
      model: u.model,
      status: u.status,
      appSlug: u.appSlug ?? "",
      createdAt: u.createdAt,
    })),
  });
}

export async function PUT(req: Request) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as
    | { id?: number; label?: string; content?: unknown }
    | null;

  if (!body?.id || typeof body.content !== "object" || body.content === null) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await dbReady();
  const db = getDb();

  await db
    .update(sections)
    .set({
      content: JSON.stringify(body.content),
      ...(body.label ? { label: body.label } : {}),
      updatedAt: Date.now(),
    })
    .where(eq(sections.id, body.id));

  return NextResponse.json({ ok: true });
}
