import { asc, eq } from "drizzle-orm";
import { dbReady, getDb, siteTemplates, templateCategories, users } from "./db";
import {
  CATEGORIES,
  TEMPLATES,
  TEMPLATE_LAYOUTS,
  TEMPLATE_THEMES,
  type Category,
  type SiteTemplate,
  type TemplateLayout,
} from "./site-templates";

export function isValidTemplateId(id: string): boolean {
  return /^[a-z0-9-]{1,40}$/.test(id);
}

function toCategory(row: typeof templateCategories.$inferSelect): Category {
  return { id: row.id, name: row.name, icon: row.icon, tagline: row.tagline };
}

function toTemplate(row: typeof siteTemplates.$inferSelect): SiteTemplate {
  return {
    id: row.id,
    category: row.category,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    theme: row.theme,
    layout: (TEMPLATE_LAYOUTS as string[]).includes(row.layout)
      ? (row.layout as TemplateLayout)
      : "grid",
    itemsLabel: row.itemsLabel,
    cta: row.cta,
    image: row.image,
  };
}

export async function listTemplateCategories(): Promise<Category[]> {
  await dbReady();
  const db = getDb();
  const rows = await db
    .select()
    .from(templateCategories)
    .orderBy(asc(templateCategories.sort));
  if (rows.length === 0) return CATEGORIES;
  return rows.map(toCategory);
}

export async function listSiteTemplates(): Promise<SiteTemplate[]> {
  await dbReady();
  const db = getDb();
  const rows = await db
    .select()
    .from(siteTemplates)
    .orderBy(asc(siteTemplates.sort));
  if (rows.length === 0) return TEMPLATES;
  return rows.map(toTemplate);
}

/** DB-first lookup with static fallback so old sites keep working. */
export async function getDbTemplate(id: string): Promise<SiteTemplate | null> {
  const clean = id.trim();
  if (!clean) return null;
  await dbReady();
  const db = getDb();
  const rows = await db
    .select()
    .from(siteTemplates)
    .where(eq(siteTemplates.id, clean));
  if (rows[0]) return toTemplate(rows[0]);
  return TEMPLATES.find((t) => t.id === clean) ?? null;
}

export type CategoryInput = {
  id: string;
  name: string;
  icon?: string;
  tagline?: string;
};

function validateCategoryInput(input: CategoryInput): string | null {
  if (!isValidTemplateId(input.id)) {
    return "Category id must be 1–40 chars: lowercase letters, numbers, dashes.";
  }
  if (!input.name.trim()) return "Category name is required.";
  return null;
}

export async function createTemplateCategory(input: CategoryInput) {
  const err = validateCategoryInput(input);
  if (err) throw new Error(err);
  await dbReady();
  const db = getDb();
  const existing = await db
    .select()
    .from(templateCategories)
    .where(eq(templateCategories.id, input.id.trim()));
  if (existing[0]) throw new Error("A category with this id already exists.");
  const all = await db.select().from(templateCategories);
  await db.insert(templateCategories).values({
    id: input.id.trim(),
    name: input.name.trim().slice(0, 60),
    icon: (input.icon ?? "").trim().slice(0, 12),
    tagline: (input.tagline ?? "").trim().slice(0, 160),
    sort: all.length,
  });
}

export async function updateTemplateCategory(id: string, patch: Omit<CategoryInput, "id">) {
  await dbReady();
  const db = getDb();
  if (!patch.name.trim()) throw new Error("Category name is required.");
  await db
    .update(templateCategories)
    .set({
      name: patch.name.trim().slice(0, 60),
      icon: (patch.icon ?? "").trim().slice(0, 12),
      tagline: (patch.tagline ?? "").trim().slice(0, 160),
    })
    .where(eq(templateCategories.id, id));
}

export async function deleteTemplateCategory(id: string) {
  await dbReady();
  const db = getDb();
  const inUse = await db
    .select({ id: siteTemplates.id })
    .from(siteTemplates)
    .where(eq(siteTemplates.category, id));
  if (inUse.length > 0) {
    throw new Error(
      `Cannot delete: ${inUse.length} template(s) still use this category. Move or delete them first.`
    );
  }
  await db.delete(templateCategories).where(eq(templateCategories.id, id));
}

export type TemplateInput = {
  id: string;
  category: string;
  name: string;
  tagline?: string;
  description?: string;
  theme: string;
  layout: string;
  itemsLabel?: string;
  cta?: string;
  image?: string;
};

function validateTemplateInput(input: TemplateInput): string | null {
  if (!isValidTemplateId(input.id)) {
    return "Template id must be 1–40 chars: lowercase letters, numbers, dashes.";
  }
  if (!input.name.trim()) return "Template name is required.";
  if (!(TEMPLATE_THEMES as readonly string[]).includes(input.theme)) {
    return `Theme must be one of: ${TEMPLATE_THEMES.join(", ")}.`;
  }
  if (!(TEMPLATE_LAYOUTS as readonly string[]).includes(input.layout)) {
    return `Layout must be one of: ${TEMPLATE_LAYOUTS.join(", ")}.`;
  }
  return null;
}

export async function createSiteTemplate(input: TemplateInput) {
  const err = validateTemplateInput(input);
  if (err) throw new Error(err);
  await dbReady();
  const db = getDb();
  const cat = await db
    .select()
    .from(templateCategories)
    .where(eq(templateCategories.id, input.category.trim()));
  if (!cat[0]) throw new Error("Selected category does not exist.");
  const existing = await db
    .select()
    .from(siteTemplates)
    .where(eq(siteTemplates.id, input.id.trim()));
  if (existing[0]) throw new Error("A template with this id already exists.");
  const all = await db.select({ id: siteTemplates.id }).from(siteTemplates);
  await db.insert(siteTemplates).values({
    id: input.id.trim(),
    category: input.category.trim(),
    name: input.name.trim().slice(0, 60),
    tagline: (input.tagline ?? "").trim().slice(0, 160),
    description: (input.description ?? "").trim().slice(0, 300),
    theme: input.theme,
    layout: input.layout,
    itemsLabel: (input.itemsLabel ?? "").trim().slice(0, 40) || "Items",
    cta: (input.cta ?? "").trim().slice(0, 40) || "Learn more",
    image: (input.image ?? "").trim().slice(0, 500),
    sort: all.length,
  });
}

export async function updateSiteTemplate(id: string, patch: Omit<TemplateInput, "id">) {
  const err = validateTemplateInput({ ...patch, id });
  if (err) throw new Error(err);
  await dbReady();
  const db = getDb();
  const cat = await db
    .select()
    .from(templateCategories)
    .where(eq(templateCategories.id, patch.category.trim()));
  if (!cat[0]) throw new Error("Selected category does not exist.");
  await db
    .update(siteTemplates)
    .set({
      category: patch.category.trim(),
      name: patch.name.trim().slice(0, 60),
      tagline: (patch.tagline ?? "").trim().slice(0, 160),
      description: (patch.description ?? "").trim().slice(0, 300),
      theme: patch.theme,
      layout: patch.layout,
      itemsLabel: (patch.itemsLabel ?? "").trim().slice(0, 40) || "Items",
      cta: (patch.cta ?? "").trim().slice(0, 40) || "Learn more",
      image: (patch.image ?? "").trim().slice(0, 500),
    })
    .where(eq(siteTemplates.id, id));
}

export async function deleteSiteTemplate(id: string) {
  await dbReady();
  const db = getDb();
  const inUse = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.templateId, id));
  if (inUse.length > 0) {
    throw new Error(
      `Cannot delete: ${inUse.length} published site(s) still use this template.`
    );
  }
  await db.delete(siteTemplates).where(eq(siteTemplates.id, id));
}
