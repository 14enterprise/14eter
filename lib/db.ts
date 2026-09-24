import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import fs from "node:fs";
import path from "node:path";
import { DEFAULT_CONTENT, PAGE_SEEDS } from "./content-defaults";

export const pages = sqliteTable("pages", {
  id: int("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
});

export const sections = sqliteTable("sections", {
  id: int("id").primaryKey({ autoIncrement: true }),
  pageId: int("page_id")
    .notNull()
    .references(() => pages.id),
  key: text("key").notNull(),
  label: text("label").notNull(),
  content: text("content", { mode: "text" }).notNull(),
  sort: int("sort").notNull().default(0),
  updatedAt: int("updated_at").notNull().default(0),
});

export const users = sqliteTable("users", {
  id: int("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  company: text("company").notNull().default(""),
  projectName: text("project_name").notNull().default(""),
  projectType: text("project_type").notNull().default(""),
  projectDescription: text("project_description").notNull().default(""),
  model: text("model").notNull().default("partner"),
  status: text("status").notNull().default("pending"),
  blueprint: text("blueprint").notNull().default(""),
  appSlug: text("app_slug").notNull().default(""),
  appHtml: text("app_html").notNull().default(""),
  templateId: text("template_id").notNull().default(""),
  siteContent: text("site_content").notNull().default(""),
  sitePages: text("site_pages").notNull().default("[]"),
  sitePagesHtml: text("site_pages_html").notNull().default("{}"),
  subscriptionStatus: text("subscription_status").notNull().default("free"),
  subscriptionPlan: text("subscription_plan").notNull().default(""),
  subscriptionExpiresAt: int("subscription_expires_at").notNull().default(0),
  paystackCustomerId: text("paystack_customer_id").notNull().default(""),
  paystackSubscriptionId: text("paystack_subscription_id").notNull().default(""),
  createdAt: int("created_at").notNull().default(0),
});

export const templateCategories = sqliteTable("template_categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull().default(""),
  tagline: text("tagline").notNull().default(""),
  sort: int("sort").notNull().default(0),
});

export const siteTemplates = sqliteTable("site_templates", {
  id: text("id").primaryKey(),
  category: text("category").notNull(),
  name: text("name").notNull(),
  tagline: text("tagline").notNull().default(""),
  description: text("description").notNull().default(""),
  theme: text("theme").notNull().default("aurora"),
  layout: text("layout").notNull().default("grid"),
  itemsLabel: text("items_label").notNull().default("Items"),
  cta: text("cta").notNull().default("Learn more"),
  image: text("image").notNull().default(""),
  sort: int("sort").notNull().default(0),
});

export const passwordResets = sqliteTable("password_resets", {
  id: int("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull(),
  tokenHash: text("token_hash").notNull(),
  expiresAt: int("expires_at").notNull(),
  usedAt: int("used_at"),
  createdAt: int("created_at").notNull(),
});

function makeClient(): Client {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  if (tursoUrl) {
    return createClient({
      url: tursoUrl,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  const fileUrl = process.env.DATABASE_URL ?? "file:./data/local.db";
  const filePath = fileUrl.replace(/^file:/, "");
  fs.mkdirSync(path.dirname(path.resolve(filePath)), { recursive: true });
  return createClient({ url: `file:${filePath}` });
}

declare global {
  var __siteClient: Client | undefined;
}

export function getClient(): Client {
  if (!globalThis.__siteClient) {
    globalThis.__siteClient = makeClient();
  }
  return globalThis.__siteClient;
}

export function getDb() {
  return drizzle(getClient());
}

async function ensureSchema(client: Client) {
  await client.execute(`CREATE TABLE IF NOT EXISTS pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL
  )`);
  await client.execute(`CREATE TABLE IF NOT EXISTS sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_id INTEGER NOT NULL REFERENCES pages(id),
    key TEXT NOT NULL,
    label TEXT NOT NULL,
    content TEXT NOT NULL,
    sort INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL DEFAULT 0
  )`);
  await client.execute(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    company TEXT NOT NULL DEFAULT '',
    project_name TEXT NOT NULL DEFAULT '',
    project_type TEXT NOT NULL DEFAULT '',
    project_description TEXT NOT NULL DEFAULT '',
    model TEXT NOT NULL DEFAULT 'partner',
    status TEXT NOT NULL DEFAULT 'pending',
    created_at INTEGER NOT NULL DEFAULT 0
  )`);
  try {
    await client.execute(
      `ALTER TABLE users ADD COLUMN model TEXT NOT NULL DEFAULT 'partner'`
    );
  } catch {
    // column already exists
  }
  try {
    await client.execute(
      `ALTER TABLE users ADD COLUMN blueprint TEXT NOT NULL DEFAULT ''`
    );
  } catch {
    // column already exists
  }
  try {
    await client.execute(
      `ALTER TABLE users ADD COLUMN app_slug TEXT NOT NULL DEFAULT ''`
    );
  } catch {
    // column already exists
  }
  try {
    await client.execute(
      `ALTER TABLE users ADD COLUMN app_html TEXT NOT NULL DEFAULT ''`
    );
  } catch {
    // column already exists
  }
  try {
    await client.execute(
      `ALTER TABLE users ADD COLUMN template_id TEXT NOT NULL DEFAULT ''`
    );
  } catch {
    // column already exists
  }
  try {
    await client.execute(
      `ALTER TABLE users ADD COLUMN site_content TEXT NOT NULL DEFAULT ''`
    );
  } catch {
    // column already exists
  }
  try {
    await client.execute(
      `ALTER TABLE users ADD COLUMN site_pages TEXT NOT NULL DEFAULT '[]'`
    );
  } catch {
    // column already exists
  }
  try {
    await client.execute(
      `ALTER TABLE users ADD COLUMN site_pages_html TEXT NOT NULL DEFAULT '{}'`
    );
  } catch {
    // column already exists
  }
  try {
    await client.execute(
      `ALTER TABLE users ADD COLUMN subscription_status TEXT NOT NULL DEFAULT 'free'`
    );
  } catch {
    // column already exists
  }
  try {
    await client.execute(
      `ALTER TABLE users ADD COLUMN subscription_plan TEXT NOT NULL DEFAULT ''`
    );
  } catch {
    // column already exists
  }
  try {
    await client.execute(
      `ALTER TABLE users ADD COLUMN subscription_expires_at INTEGER NOT NULL DEFAULT 0`
    );
  } catch {
    // column already exists
  }
  try {
    await client.execute(
      `ALTER TABLE users ADD COLUMN paystack_customer_id TEXT NOT NULL DEFAULT ''`
    );
  } catch {
    // column already exists
  }
  try {
    await client.execute(
      `ALTER TABLE users ADD COLUMN paystack_subscription_id TEXT NOT NULL DEFAULT ''`
    );
  } catch {
    // column already exists
  }
  await client.execute(`CREATE TABLE IF NOT EXISTS template_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT '',
    tagline TEXT NOT NULL DEFAULT '',
    sort INTEGER NOT NULL DEFAULT 0
  )`);
  await client.execute(`CREATE TABLE IF NOT EXISTS site_templates (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    tagline TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    theme TEXT NOT NULL DEFAULT 'aurora',
    layout TEXT NOT NULL DEFAULT 'grid',
    items_label TEXT NOT NULL DEFAULT 'Items',
    cta TEXT NOT NULL DEFAULT 'Learn more',
    image TEXT NOT NULL DEFAULT '',
    sort INTEGER NOT NULL DEFAULT 0
  )`);
  await client.execute(`CREATE TABLE IF NOT EXISTS password_resets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    token_hash TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    used_at INTEGER,
    created_at INTEGER NOT NULL
  )`);
}

async function seedIfEmpty(client: Client) {
  for (const page of PAGE_SEEDS) {
    const existing = await client.execute({
      sql: "SELECT id FROM pages WHERE slug = ?",
      args: [page.slug],
    });

    let pageId: number;
    if (existing.rows.length === 0) {
      const inserted = await client.execute({
        sql: "INSERT INTO pages (slug, title) VALUES (?, ?)",
        args: [page.slug, page.title],
      });
      pageId = Number(inserted.lastInsertRowid);
    } else {
      pageId = Number(existing.rows[0].id);
    }

    for (const section of page.sections) {
      const has = await client.execute({
        sql: "SELECT id FROM sections WHERE page_id = ? AND key = ?",
        args: [pageId, section.key],
      });
      if (has.rows.length > 0) continue;
      await client.execute({
        sql: "INSERT INTO sections (page_id, key, label, content, sort, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
        args: [
          pageId,
          section.key,
          section.label,
          JSON.stringify(section.content ?? DEFAULT_CONTENT[section.key] ?? {}),
          section.sort,
          Date.now(),
        ],
      });
    }
  }
}

async function seedTemplatesIfEmpty(client: Client) {
  const { CATEGORIES, TEMPLATES } = await import("./site-templates");

  const catCount = await client.execute(`SELECT COUNT(*) AS n FROM template_categories`);
  if (Number(catCount.rows[0]?.n ?? 0) === 0) {
    for (let i = 0; i < CATEGORIES.length; i++) {
      const c = CATEGORIES[i];
      await client.execute({
        sql: "INSERT INTO template_categories (id, name, icon, tagline, sort) VALUES (?, ?, ?, ?, ?)",
        args: [c.id, c.name, c.icon, c.tagline, i],
      });
    }
  }

  const tplCount = await client.execute(`SELECT COUNT(*) AS n FROM site_templates`);
  if (Number(tplCount.rows[0]?.n ?? 0) === 0) {
    for (let i = 0; i < TEMPLATES.length; i++) {
      const t = TEMPLATES[i];
      await client.execute({
        sql: "INSERT INTO site_templates (id, category, name, tagline, description, theme, layout, items_label, cta, image, sort) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        args: [
          t.id,
          t.category,
          t.name,
          t.tagline,
          t.description,
          t.theme,
          t.layout,
          t.itemsLabel,
          t.cta,
          t.image,
          i,
        ],
      });
    }
  }
}

async function sanitizePartnerSections(client: Client) {
  const rows = await client.execute(
    `SELECT id, content FROM sections WHERE key = 'partners'`
  );
  for (const row of rows.rows) {
    let content: { partners?: unknown[]; badge?: string } = {};
    try {
      content = JSON.parse(String(row.content));
    } catch {
      continue;
    }
    let changed = false;
    if (Array.isArray(content.partners)) {
      for (const p of content.partners) {
        if (typeof p === "object" && p !== null) {
          const rec = p as Record<string, unknown>;
          if ("email" in rec || "password" in rec) {
            delete rec.email;
            delete rec.password;
            changed = true;
          }
          if (!("color" in rec)) {
            rec.color = "";
            changed = true;
          }
          if (!("logo" in rec)) {
            rec.logo = "";
            changed = true;
          }
        }
      }
    }
    if (content.badge === "Our Partners") {
      content.badge = "Our Clients & Partners";
      changed = true;
    }
    if (changed) {
      await client.execute({
        sql: "UPDATE sections SET content = ? WHERE id = ?",
        args: [JSON.stringify(content), Number(row.id)],
      });
    }
  }
}

let ready: Promise<void> | null = null;

export async function dbReady() {
  const client = getClient();
  if (!ready) {
    ready = (async () => {
      await ensureSchema(client);
      await seedIfEmpty(client);
      await seedTemplatesIfEmpty(client);
      await sanitizePartnerSections(client);
    })();
  }
  await ready;
}
