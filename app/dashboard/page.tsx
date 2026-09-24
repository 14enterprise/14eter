import { cookies } from "next/headers";
import PortalShell from "@/components/PortalShell";
import { PARTNER_COOKIE, verifyPartnerToken } from "@/lib/partner-token";
import { findUserByEmail } from "@/lib/users-db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Partner Portal | 14Eter Limited",
};

export default async function DashboardPage() {
  const store = await cookies();
  const session = await verifyPartnerToken(store.get(PARTNER_COOKIE)?.value);
  const user = session ? await findUserByEmail(session.email) : null;

  if (!user) return null;

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
        appSlug: user.appSlug ?? "",
        appHtml: user.appHtml ?? "",
        createdAt: user.createdAt,
      }}
    />
  );
}