import { NextRequest, NextResponse } from "next/server";
import { USER_COOKIE, verifyUserToken } from "@/lib/user-auth";
import { findUserByEmail, setUserApp, setUserPages } from "@/lib/users-db";
import { renderPage, renderSite } from "@/lib/app-factory";
import { getDbTemplate } from "@/lib/templates-db";
import {
  normalizeContent,
  normalizePage,
  slugifyPage,
  type SitePage,
} from "@/lib/site-templates";
import type { UserRecord } from "@/lib/users-db";

export const runtime = "nodejs";

function parseJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function rebuildSite(user: UserRecord) {
  const template = await getDbTemplate(user.templateId ?? "");
  if (!template) {
    throw new Error("No template selected for this site.");
  }

  const content = normalizeContent(parseJson(user.siteContent, {}), template);
  const sitePages = (parseJson<SitePage[]>(user.sitePages, []) ?? []).filter(
    Boolean
  );

  const canonical = `${user.appSlug}.14eter.org`;
  const nav = sitePages.map((p) => ({ id: p.id, label: p.navLabel }));

  const html = renderSite(template, content, canonical, nav, "home");

  const pagesHtml: Record<string, string> = {};
  for (const page of sitePages) {
    pagesHtml[page.id] = renderPage(
      template,
      page,
      `${user.appSlug}.14eter.org/${page.slug}`,
      nav,
      page.id,
      content.brand,
      content.phone
    );
  }

  await setUserApp(user.id, user.appSlug, html);
  await setUserPages(user.id, JSON.stringify(sitePages), JSON.stringify(pagesHtml));
  return { pages: sitePages };
}

export async function GET(req: NextRequest) {
  const session = await verifyUserToken(req.cookies.get(USER_COOKIE)?.value ?? null);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await findUserByEmail(session.email);
  if (!user || !user.appSlug) {
    return NextResponse.json({ error: "No site yet" }, { status: 404 });
  }
  const pages = parseJson<SitePage[]>(user.sitePages, []) ?? [];
  return NextResponse.json({
    ok: true,
    slug: user.appSlug,
    pages,
    home: parseJson(user.siteContent, {}),
  });
}

export async function POST(req: NextRequest) {
  const session = await verifyUserToken(req.cookies.get(USER_COOKIE)?.value ?? null);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await findUserByEmail(session.email);
  if (!user || user.model === "partner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = ((await req.json().catch(() => ({}))) ?? {}) as {
    action?: string;
    page?: unknown;
    id?: string;
    title?: string;
  };
  const action = body?.action ?? "";
  let pages = parseJson<SitePage[]>(user.sitePages, []) ?? [];
  let updatedPage: SitePage | null = null;

  if (action === "create") {
    const raw =
      (body.page as Record<string, unknown> | null) ?? { title: body.title ?? "New page" };
    const page = normalizePage(raw);
    if (!page) {
      return NextResponse.json({ error: "Give the page a title." }, { status: 400 });
    }
    page.id = page.slug;
    const taken = new Set(pages.map((p) => p.slug));
    let slug = page.slug;
    let n = 2;
    while (taken.has(slug)) slug = `${page.slug}-${n++}`;
    page.slug = slug;
    page.id = slug;
    pages.push(page);
  } else if (action === "update") {
    const page = normalizePage(body.page);
    if (!page) return NextResponse.json({ error: "Invalid page." }, { status: 400 });
    const idx = pages.findIndex((p) => p.id === page.id);
    if (idx === -1) {
      return NextResponse.json({ error: "Page not found." }, { status: 404 });
    }
    // Keep the URL in sync with the title: id and slug always follow the
    // slugified title (e.g. "Contact" -> /contact), deduplicated.
    // Note: the slug is re-derived from the title because the client sends
    // back the previous slug, which would otherwise freeze the old URL.
    const base = slugifyPage(page.title);
    const taken = new Set<string>();
    pages.forEach((p, i) => {
      if (i === idx) return;
      if (p.slug) taken.add(p.slug);
      if (p.id) taken.add(p.id);
    });
    let slug = base;
    let n = 2;
    while (taken.has(slug)) slug = `${base}-${n++}`;
    pages[idx] = { ...page, slug, id: slug };
    updatedPage = pages[idx];
  } else if (action === "delete") {
    const id = String(body.id ?? "");
    if (!id || id === "home" || id === "") {
      return NextResponse.json(
        { error: "The homepage cannot be deleted." },
        { status: 400 }
      );
    }
    pages = pages.filter((p) => p.id !== id);
  } else {
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  }

  // Echo back the affected page so the editor can follow id changes on rename.
  if (!user.appSlug || !(await getDbTemplate(user.templateId ?? ""))) {
    await setUserPages(user.id, JSON.stringify(pages), user.sitePagesHtml ?? "{}");
    return NextResponse.json({ ok: true, pages, page: updatedPage });
  }

  const updated = { ...user, sitePages: JSON.stringify(pages) } as UserRecord;
  await rebuildSite(updated);
  return NextResponse.json({ ok: true, pages, page: updatedPage });
}
