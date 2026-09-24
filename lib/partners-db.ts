import { eq } from "drizzle-orm";
import { dbReady, getDb, sections } from "./db";
import type { Partner } from "./content-defaults";

type PartnerRecord = Partner & { sourceSectionId: number };

export async function findPartners(): Promise<PartnerRecord[]> {
  await dbReady();
  const db = getDb();
  const rows = await db
    .select()
    .from(sections)
    .where(eq(sections.key, "partners"));

  const out: PartnerRecord[] = [];
  for (const row of rows) {
    let content: { partners?: Partner[] } = {};
    try {
      content = JSON.parse(row.content);
    } catch {}
    for (const p of content.partners ?? []) {
      out.push({ ...p, sourceSectionId: row.id });
    }
  }
  return out;
}
