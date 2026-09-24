"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import SiteAdminShell from "@/components/diy/SiteAdminShell";
import PaymentHandler from "@/components/diy/PaymentHandler";
import type { SitePage } from "@/lib/site-templates";

export type PortalUser = {
  id: number;
  name: string;
  email: string;
  company: string;
  projectName: string;
  projectType: string;
  projectDescription: string;
  model: "partner" | "diy";
  status: string;
  templateId?: string;
  siteContent?: string;
  sitePages?: SitePage[];
  appSlug?: string;
  appHtml?: string;
  createdAt: number;
};

const NAV = [
  { id: "overview", label: "Overview", icon: "🏠" },
  { id: "project", label: "My Project", icon: "📋" },
  { id: "account", label: "Account", icon: "🪪" },
  { id: "contact", label: "Contact Us", icon: "📧" },
] as const;

type NavId = (typeof NAV)[number]["id"];

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  pending: {
    label: "Under Review",
    className: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
  approved: {
    label: "Approved",
    className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-brand/15 text-brand border-brand/30",
  },
  completed: {
    label: "Completed",
    className: "bg-accent/15 text-accent border-accent/30",
  },
};

const PARTNER_STEPS = [
  { icon: "📬", title: "Application received", body: "We've got your project details." },
  { icon: "📞", title: "Scoping call", body: "We'll schedule a call to walk through your vision." },
  { icon: "🤝", title: "Proposal & equity terms", body: "We'll share fees, milestones, and equity structure." },
  { icon: "🚀", title: "Build begins", body: "Development kicks off on the agreed milestones." },
];

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function PortalShell({ user }: { user: PortalUser }) {
  const router = useRouter();
  const [active, setActive] = useState<NavId>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isDiy = user.model !== "partner";
  const first = user.name.split(" ")[0];
  const status = STATUS_LABELS[user.status] ?? STATUS_LABELS.pending;

  const headings: Record<NavId, { title: string; sub: string }> = {
    overview: {
      title: `Welcome${first ? `, ${first}` : ""} 👋`,
      sub: isDiy
        ? "Pick a template for your category, customize it, and publish your own live site on a 14eter.org subdomain."
        : "Here is what happens next with your project. We will reach out shortly.",
    },
    project: { title: "My Project", sub: "What we know about your project." },
    account: { title: "Account", sub: "Your registration details." },
    contact: { title: "Contact Us", sub: "We'd love to hear from you." },
  };

  async function handleLogout() {
    await fetch(isDiy ? "/api/user/session" : "/api/partner/session", {
      method: "DELETE",
    });
    router.replace("/login");
  }

  function select(id: NavId) {
    setActive(id);
    setSidebarOpen(false);
  }

  const navItems = NAV.map((n) => (
    <button
      key={n.id}
      onClick={() => select(n.id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
        active === n.id
          ? "bg-brand text-white shadow-lg shadow-brand/25"
          : "text-gray-400 hover:text-white hover:bg-gray-800/70"
      }`}
    >
      <span className="text-lg">{n.icon}</span>
      <span>{n.label}</span>
    </button>
  ));

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-40 bg-black/80 backdrop-blur-lg border-b border-white/10">
        <div className="px-4 py-3.5 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            className="w-10 h-10 -ml-2 rounded-lg flex items-center justify-center text-gray-300 hover:bg-gray-800 transition"
          >
            ☰
          </button>
          <Logo />
          <a
            href="/"
            target="_blank"
            className="text-xs font-semibold text-gray-400 hover:text-white border border-gray-700 rounded-full px-3 py-1.5 transition"
          >
            View Site ↗
          </a>
        </div>
      </header>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <aside
            className="absolute left-0 top-0 h-full w-72 max-w-[85vw] bg-gray-950 border-r border-gray-800 p-5 flex flex-col transform transition-transform duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <Logo />
              <button
                onClick={() => setSidebarOpen(false)}
                aria-label="Close menu"
                className="w-9 h-9 rounded-lg bg-gray-800 text-gray-300 hover:text-white transition"
              >
                ✕
              </button>
            </div>
            <nav className="space-y-2 flex-1">{navItems}</nav>
            <button
              onClick={handleLogout}
              className="mt-auto w-full text-sm font-semibold bg-gray-900 border border-gray-700 hover:border-red-500 hover:text-red-400 transition rounded-xl px-4 py-3"
            >
              Logout
            </button>
          </aside>
        </div>
      )}

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col bg-gray-950 border-r border-gray-800 p-5 z-30">
          <div className="mb-8 px-1">
            <Link href="/">
              <Logo />
            </Link>
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand mt-2 ml-0.5">
              {isDiy ? "AI App Factory" : "Partner With Us"}
            </p>
          </div>
          <nav className="space-y-2 flex-1">{navItems}</nav>
          <div className="space-y-2 pt-4 border-t border-gray-800">
            <a
              href="/"
              target="_blank"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-400 hover:text-white hover:bg-gray-800/70 transition"
            >
              🌐 View Site
            </a>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition"
            >
              🚪 Logout
            </button>
          </div>
        </aside>

        {/* Main area */}
        <div className="flex-1 lg:ml-64 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 w-[900px] h-[350px] bg-brand/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-6xl mx-auto px-6 py-10 relative z-10">
            <div className="hidden lg:block mb-8">
              <h1 className="text-2xl md:text-3xl font-bold">{headings[active].title}</h1>
              <p className="text-gray-400 mt-1">{headings[active].sub}</p>
            </div>

            {active === "overview" && (
              <>
                <div className="mb-6 lg:hidden">
                  <h1 className="text-2xl md:text-3xl font-bold">{headings.overview.title}</h1>
                  <p className="text-gray-400 mt-1">{headings.overview.sub}</p>
                </div>

                <div className="mb-6 bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 shadow-2xl">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2">
                        Project Status
                      </p>
                      <p className="text-2xl font-bold">{user.projectName || "Untitled project"}</p>
                    </div>
                    <span
                      className={`inline-block w-fit text-xs font-bold uppercase tracking-wide border rounded-full px-3 py-1.5 ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </div>
                </div>

                {isDiy ? (
                  <section className="bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 shadow-2xl">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-accent mb-2">
                      Your Site Builder
                    </h2>
                    <p className="text-2xl font-bold mb-6">
                      Build it yourself{first ? `, ${first}` : ""} 🛠️
                    </p>
                    <PaymentHandler />
                    <SiteAdminShell
                      initialTemplateId={user.templateId ?? ""}
                      initialSiteContent={user.siteContent ?? ""}
                      initialAppSlug={user.appSlug ?? ""}
                      initialPages={user.sitePages ?? []}
                      hasApp={Boolean(user.appHtml)}
                      onSubdomain={false}
                    />
                  </section>
                ) : (
                  <section className="bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 shadow-2xl">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-brand mb-2">
                      Your Partnership Journey
                    </h2>
                    <p className="text-2xl font-bold mb-8">
                      Let&apos;s build together{first ? `, ${first}` : ""} 🤝
                    </p>
                    <ol className="space-y-0">
                      {PARTNER_STEPS.map((s, i) => (
                        <li key={s.title} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-11 h-11 rounded-full bg-brand/15 border border-brand/30 flex items-center justify-center text-xl shrink-0">
                              {s.icon}
                            </div>
                            {i < PARTNER_STEPS.length - 1 && (
                              <div className="w-px flex-1 bg-gray-800 my-1" />
                            )}
                          </div>
                          <div className="pb-8">
                            <p className="font-bold mb-1">
                              <span className="text-brand text-sm mr-1">{i + 1}.</span>
                              {s.title}
                            </p>
                            <p className="text-gray-400 text-sm leading-relaxed">{s.body}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                    <p className="text-xs text-gray-500">
                      Dummy content — your partnership steps will be configured soon.
                    </p>
                  </section>
                )}
              </>
            )}

            {active === "project" && (
              <section className="bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 shadow-2xl lg:mt-4">
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-6">
                  Your Project
                </h2>
                <dl className="space-y-5 text-sm">
                  <div>
                    <dt className="text-gray-500 mb-1">Project name</dt>
                    <dd className="font-medium text-base">{user.projectName || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 mb-1">Type</dt>
                    <dd className="font-medium">{user.projectType || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 mb-1">Website Model</dt>
                    <dd className="font-medium">{isDiy ? "AI App Factory" : "Partner With Us"}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 mb-1">About the project</dt>
                    <dd className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {user.projectDescription || "—"}
                    </dd>
                  </div>
                </dl>
              </section>
            )}

            {active === "account" && (
              <section className="bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 shadow-2xl lg:mt-4">
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-6">
                  Account
                </h2>
                <dl className="space-y-5 text-sm">
                  <div>
                    <dt className="text-gray-500 mb-1">Name</dt>
                    <dd className="font-medium">{user.name || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 mb-1">Email</dt>
                    <dd className="font-medium">{user.email || "—"}</dd>
                  </div>
                  {user.company && (
                    <div>
                      <dt className="text-gray-500 mb-1">Company / Organization</dt>
                      <dd className="font-medium">{user.company}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-gray-500 mb-1">Website Model</dt>
                    <dd className="font-medium">{isDiy ? "AI App Factory" : "Partner With Us"}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 mb-1">Registered</dt>
                    <dd className="font-medium">{user.createdAt ? formatDate(user.createdAt) : "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 mb-2">Status</dt>
                    <dd>
                      <span className={`inline-block text-xs font-bold uppercase tracking-wide border rounded-full px-3 py-1 ${status.className}`}>
                        {status.label}
                      </span>
                    </dd>
                  </div>
                </dl>
              </section>
            )}

            {active === "contact" && (
              <div className="lg:mt-4 space-y-6">
                <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 shadow-2xl">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">
                    Get in touch
                  </h2>
                  <p className="text-gray-300 leading-relaxed max-w-xl">
                    Anything else you&apos;d like to tell us? More details help us respond
                    faster. Send us a message or write to us directly.
                  </p>
                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <Link
                      href="/contact"
                      className="inline-block bg-white text-black hover:bg-brand hover:text-white transition font-bold px-6 py-3 rounded-full text-center"
                    >
                      Contact us
                    </Link>
                    <a
                      href="mailto:info@14eter.org"
                      className="inline-block bg-gray-900 border border-gray-700 hover:border-brand hover:text-brand transition font-bold px-6 py-3 rounded-full text-center text-gray-300"
                    >
                      info@14eter.org
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
