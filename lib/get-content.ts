import { asc, eq, and } from "drizzle-orm";
import { dbReady, getDb, pages, sections } from "./db";
import { DEFAULT_CONTENT, type Product, type ProductsContent } from "./content-defaults";

export async function getPageContent(
  slug: string
): Promise<Record<string, Record<string, unknown>>> {
  try {
    await dbReady();
    const db = getDb();

    const [page] = await db.select().from(pages).where(eq(pages.slug, slug));
    if (!page) return {};

    const rows = await db
      .select()
      .from(sections)
      .where(eq(sections.pageId, page.id))
      .orderBy(asc(sections.sort));

    const out: Record<string, Record<string, unknown>> = {};
    for (const row of rows) {
      let parsed: Record<string, unknown> = {};
      try {
        parsed = JSON.parse(row.content);
      } catch {}
      out[row.key] = {
        ...((DEFAULT_CONTENT[row.key] as Record<string, unknown>) ?? {}),
        ...parsed,
      };
    }
    return out;
  } catch (err) {
    console.error("getPageContent failed, using defaults:", err);
    return DEFAULT_CONTENT as Record<string, Record<string, unknown>>;
  }
}

export async function getProducts(): Promise<Product[]> {
  try {
    await dbReady();
    const db = getDb();
    const [page] = await db.select().from(pages).where(eq(pages.slug, "home"));
    if (!page) return defaultProducts();
    const [row] = await db
      .select()
      .from(sections)
      .where(
        and(eq(sections.pageId, page.id), eq(sections.key, "products"))
      );
    if (!row) return defaultProducts();
    const parsed = JSON.parse(row.content) as { products?: unknown };
    if (!Array.isArray(parsed.products)) return defaultProducts();
    return parsed.products
      .map((p) => {
        const rec = (p && typeof p === "object" ? p : {}) as Record<
          string,
          unknown
        >;
        return {
          name: String(rec.name ?? "").trim(),
          url: String(rec.url ?? "").trim(),
        };
      })
      .filter((p) => p.name && p.url);
  } catch (err) {
    console.error("getProducts failed, using defaults:", err);
    return defaultProducts();
  }
}

function defaultProducts(): Product[] {
  const content = DEFAULT_CONTENT.products as ProductsContent | undefined;
  return content?.products ?? [];
}
