import { cookies } from "next/headers";
import PortalShell from "@/components/PortalShell";
import { USER_COOKIE, verifyUserToken } from "@/lib/user-auth";
import { findUserByEmail } from "@/lib/users-db";
import type { SitePage } from "@/lib/site-templates";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Client Dashboard | 14Eter Limited",
};

export default async function UserDashboardPage() {
  const store = await cookies();
  const session = await verifyUserToken(store.get(USER_COOKIE)?.value);
  const user = session ? await findUserByEmail(session.email) : null;

  if (!user) return null;

  let sitePages: SitePage[] = [];
  try {
    const parsed = JSON.parse(user.sitePages ?? "[]");
    if (Array.isArray(parsed)) {
      sitePages = parsed.filter((p) => p && typeof p === "object") as SitePage[];
    }
  } catch {
    sitePages = [];
  }

  return (
    <PortalShell
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        company: user.company,
        projectName: user.projectName,
        projectType: user.projectType,
        projectDescription: user.projectDescription,
        model: user.model === "diy" ? "diy" : "partner",
        status: user.status,
        templateId: user.templateId ?? "",
        siteContent: user.siteContent ?? "",
        sitePages,
        appSlug: user.appSlug ?? "",
        appHtml: user.appHtml ?? "",
        createdAt: user.createdAt,
      }}
    />
  );
}
