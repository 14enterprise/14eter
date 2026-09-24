import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import { findUserByAppSlug } from "@/lib/users-db";
import { USER_COOKIE, verifyUserToken } from "@/lib/user-auth";
import type { SitePage } from "@/lib/site-templates";
import SiteAdminShell from "@/components/diy/SiteAdminShell";
import { LogoutButton, SiteAdminLogin } from "@/components/diy/site-admin";

export const dynamic = "force-dynamic";

export default async function SiteAdminPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cleanSlug = slug.trim().toLowerCase();
  const user = await findUserByAppSlug(cleanSlug);
  if (!user || !user.appHtml) notFound();

  const store = await cookies();
  const session = await verifyUserToken(store.get(USER_COOKIE)?.value);
  const owner =
    session && session.email.trim().toLowerCase() === user.email.trim().toLowerCase();

  if (!owner) {
    return <SiteAdminLogin slug={cleanSlug} />;
  }

  const reqHeaders = await headers();
  const host = (reqHeaders.get("host") ?? "").replace(/:\d+$/, "").toLowerCase();
  const onSubdomain = /^[a-z0-9-]+\.14eter\.org$/.test(host);

  let pages: SitePage[] = [];
  try {
    const parsed = JSON.parse(user.sitePages ?? "[]");
    if (Array.isArray(parsed)) pages = parsed.filter((p) => p && typeof p === "object");
  } catch {
    pages = [];
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-brand" />
            <p className="text-sm font-bold">
              Site admin{" "}
              <span className="text-gray-500 font-normal">
                · {cleanSlug}.14eter.org
              </span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="./"
              className="text-xs font-semibold text-gray-400 hover:text-white transition"
            >
              View live site ↗
            </a>
            <LogoutButton />
          </div>
        </div>
      </header>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">
          Content management — use the sidebar to switch pages. The homepage is always
          live and cannot be deleted.
        </p>
        <SiteAdminShell
          initialTemplateId={user.templateId}
          initialSiteContent={user.siteContent}
          initialAppSlug={user.appSlug}
          initialPages={pages}
          hasApp={Boolean(user.appHtml)}
          onSubdomain={onSubdomain}
        />
      </div>
    </main>
  );
}