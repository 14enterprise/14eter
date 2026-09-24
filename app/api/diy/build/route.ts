import { NextRequest, NextResponse } from "next/server";
import { USER_COOKIE, verifyUserToken } from "@/lib/user-auth";
import {
  findUserByAppSlug,
  findUserByEmail,
  setUserApp,
  setUserPages,
  setUserSite,
  getUserSubscriptionStatus,
} from "@/lib/users-db";
import { renderPage, renderSite, slugify } from "@/lib/app-factory";
import { getDbTemplate } from "@/lib/templates-db";
import {
  normalizeContent,
  normalizePage,
  type SitePage,
} from "@/lib/site-templates";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await verifyUserToken(req.cookies.get(USER_COOKIE)?.value ?? null);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await findUserByEmail(session.email);
  if (!user || user.model === "partner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as
    | { templateId?: string; content?: unknown; pages?: unknown; draft?: boolean }
    | null;

  const template = await getDbTemplate(body?.templateId ?? "");
  if (!template) {
    return NextResponse.json(
      { error: "Pick a template for your site first." },
      { status: 400 }
    );
  }

  const content = normalizeContent(body?.content, template);

  let sitePages: SitePage[] = [];
  if (Array.isArray(body?.pages)) {
    const candidates = body.pages
      .map((p) => normalizePage(p))
      .filter((p): p is SitePage => p !== null);
    const seen = new Set<string>();
    for (const p of candidates) {
      let slug = p.slug;
      let n = 2;
      while (seen.has(slug)) slug = `${p.slug}-${n++}`;
      seen.add(slug);
      sitePages.push({ ...p, slug });
    }
  } else {
    try {
      const stored = JSON.parse(user.sitePages ?? "[]");
      if (Array.isArray(stored)) {
        sitePages = stored
          .map((p) => normalizePage(p))
          .filter((p): p is SitePage => p !== null);
      }
    } catch {
      sitePages = [];
    }
  }

  if (body?.draft) {
    await setUserSite(user.id, template.id, JSON.stringify(content));
    await setUserPages(user.id, JSON.stringify(sitePages), "{}");
    return NextResponse.json({ ok: true, draft: true });
  }

  const subscription = await getUserSubscriptionStatus(user.id);
  if (!subscription.isActive) {
    // Save the work as a draft first so nothing is lost, then ask for subscription.
    await setUserSite(user.id, template.id, JSON.stringify(content));
    await setUserPages(user.id, JSON.stringify(sitePages), "{}");
    return NextResponse.json(
      {
        error: "Subscription required to publish. Your work was saved as a draft.",
        requiresSubscription: true,
        draftSaved: true,
        subscription,
      },
      { status: 402 }
    );
  }

  let slug = user.appSlug || slugify(content.brand || user.projectName || user.name || "myapp");
  if (!user.appSlug) {
    let candidate = slug;
    let n = 2;
    while ((await findUserByAppSlug(candidate)) !== null) {
      candidate = `${slug}-${n++}`;
      if (n > 50) break;
    }
    slug = candidate;
  }

  const canonical = `${slug}.14eter.org`;
  const nav = sitePages.map((p) => ({ id: p.id, label: p.navLabel }));

  const html = renderSite(template, content, canonical, nav, "home");

  const pagesHtml: Record<string, string> = {};
  for (const page of sitePages) {
    pagesHtml[page.id] = renderPage(
      template,
      page,
      `${slug}.14eter.org/${page.slug}`,
      nav,
      page.id,
      content.brand,
      content.phone
    );
  }

  await setUserApp(user.id, slug, html);
  await setUserSite(user.id, template.id, JSON.stringify(content));
  await setUserPages(user.id, JSON.stringify(sitePages), JSON.stringify(pagesHtml));

  const origin = new URL(req.url).origin;
  return NextResponse.json({
    ok: true,
    slug,
    pages: sitePages,
    url: `${origin}/app/${slug}`,
    subdomain: `https://${slug}.14eter.org`,
  });
}