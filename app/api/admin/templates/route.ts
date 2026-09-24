import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import {
  createSiteTemplate,
  createTemplateCategory,
  deleteSiteTemplate,
  deleteTemplateCategory,
  listSiteTemplates,
  listTemplateCategories,
  updateSiteTemplate,
  updateTemplateCategory,
} from "@/lib/templates-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function payload(req: Request) {
  const [categories, templates] = await Promise.all([
    listTemplateCategories(),
    listSiteTemplates(),
  ]);
  return NextResponse.json(
    { ok: true, categories, templates },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function GET(req: Request) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    return await payload(req);
  } catch (err) {
    console.error("Admin templates fetch failed:", err);
    return NextResponse.json({ error: "Could not load templates." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as {
    action?: string;
    id?: string;
    category?: unknown;
    template?: unknown;
  } | null;

  try {
    switch (body?.action) {
      case "category.create": {
        const c = (body.category ?? {}) as Record<string, unknown>;
        await createTemplateCategory({
          id: String(c.id ?? ""),
          name: String(c.name ?? ""),
          icon: String(c.icon ?? ""),
          tagline: String(c.tagline ?? ""),
        });
        break;
      }
      case "category.update": {
        const c = (body.category ?? {}) as Record<string, unknown>;
        if (!body?.id) return NextResponse.json({ error: "Missing id." }, { status: 400 });
        await updateTemplateCategory(body.id, {
          name: String(c.name ?? ""),
          icon: String(c.icon ?? ""),
          tagline: String(c.tagline ?? ""),
        });
        break;
      }
      case "category.delete": {
        if (!body?.id) return NextResponse.json({ error: "Missing id." }, { status: 400 });
        await deleteTemplateCategory(body.id);
        break;
      }
      case "template.create": {
        const t = (body.template ?? {}) as Record<string, unknown>;
        await createSiteTemplate({
          id: String(t.id ?? ""),
          category: String(t.category ?? ""),
          name: String(t.name ?? ""),
          tagline: String(t.tagline ?? ""),
          description: String(t.description ?? ""),
          theme: String(t.theme ?? ""),
          layout: String(t.layout ?? ""),
          itemsLabel: String(t.itemsLabel ?? ""),
          cta: String(t.cta ?? ""),
          image: String(t.image ?? ""),
        });
        break;
      }
      case "template.update": {
        const t = (body.template ?? {}) as Record<string, unknown>;
        if (!body?.id) return NextResponse.json({ error: "Missing id." }, { status: 400 });
        await updateSiteTemplate(body.id, {
          category: String(t.category ?? ""),
          name: String(t.name ?? ""),
          tagline: String(t.tagline ?? ""),
          description: String(t.description ?? ""),
          theme: String(t.theme ?? ""),
          layout: String(t.layout ?? ""),
          itemsLabel: String(t.itemsLabel ?? ""),
          cta: String(t.cta ?? ""),
          image: String(t.image ?? ""),
        });
        break;
      }
      case "template.delete": {
        if (!body?.id) return NextResponse.json({ error: "Missing id." }, { status: 400 });
        await deleteSiteTemplate(body.id);
        break;
      }
      default:
        return NextResponse.json({ error: "Unknown action." }, { status: 400 });
    }
    return await payload(req);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Operation failed." },
      { status: 400 }
    );
  }
}
