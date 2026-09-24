import { NextResponse } from "next/server";
import { listSiteTemplates, listTemplateCategories } from "@/lib/templates-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [categories, templates] = await Promise.all([
      listTemplateCategories(),
      listSiteTemplates(),
    ]);
    return NextResponse.json(
      { ok: true, categories, templates },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("Templates fetch failed:", err);
    return NextResponse.json({ error: "Could not load templates." }, { status: 500 });
  }
}
