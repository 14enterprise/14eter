"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import ContentManager from "@/components/admin/ContentManager";
import TemplatesView from "@/components/admin/TemplatesView";
import ClientsView from "@/components/admin/ClientsView";
import PartnersView from "@/components/admin/PartnersView";
import EmailComposer from "@/components/admin/EmailComposer";
import ContractView from "@/components/admin/ContractView";
import type { ClientRow, PageRow, PartnerUserRow } from "@/components/admin/types";

const menus = [
  { id: "content", label: "Content Management", icon: "📝" },
  { id: "templates", label: "Templates", icon: "🎨" },
  { id: "clients", label: "View Clients", icon: "👥" },
  { id: "partners", label: "View Partners", icon: "🏢" },
  { id: "emails", label: "Send Emails", icon: "✉️" },
  { id: "contract", label: "Contract Template", icon: "📄" },
] as const;

type MenuId = (typeof menus)[number]["id"];

const headings: Record<MenuId, { title: string; sub: string }> = {
  content: {
    title: "Content Management",
    sub: "Select a page, then pick a section to edit. Changes go live immediately.",
  },
  templates: {
    title: "Templates",
    sub: "Create, edit and delete site categories and templates for the AI App Factory.",
  },
  clients: {
    title: "View Clients",
    sub: "AI App Factory clients only. Partner With Us users live under View Partners.",
  },
  partners: {
    title: "View Partners",
    sub: "Partner sites on display and registered partners with portal access.",
  },
  emails: {
    title: "Send Emails",
    sub: "Send updates to registered partners.",
  },
  contract: {
    title: "Contract Agreement Template",
    sub: "The standard partnership agreement used for new engagements.",
  },
};

export default function AdminPage() {
  const router = useRouter();
  const [pagesData, setPagesData] = useState<PageRow[]>([]);
  const [partnerUsers, setPartnerUsers] = useState<PartnerUserRow[]>([]);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [menu, setMenu] = useState<MenuId>("content");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/data", { cache: "no-store" });
    if (res.status === 401) {
      router.replace("/admin/login");
      return;
    }
    const json = (await res.json()) as {
      pages: PageRow[];
      partnerUsers: PartnerUserRow[];
      clients: ClientRow[];
    };
    setPagesData(json.pages ?? []);
    setPartnerUsers(json.partnerUsers ?? []);
    setClients(json.clients ?? []);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.replace("/admin/login");
  }

  function selectMenu(id: MenuId) {
    setMenu(id);
    setSidebarOpen(false);
  }

  const navItems = menus.map((m) => (
    <button
      key={m.id}
      onClick={() => selectMenu(m.id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
        menu === m.id
          ? "bg-brand text-white shadow-lg shadow-brand/25"
          : "text-gray-400 hover:text-white hover:bg-gray-800/70"
      }`}
    >
      <span className="text-lg">{m.icon}</span>
      <span>{m.label}</span>
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
              Super Admin
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
            {!loading && (
              <div className="hidden lg:block mb-8">
                <h1 className="text-2xl md:text-3xl font-bold">{headings[menu].title}</h1>
                <p className="text-gray-400 mt-1">{headings[menu].sub}</p>
              </div>
            )}

            {loading ? (
              <p className="text-gray-500 animate-pulse">Loading dashboard…</p>
            ) : menu === "content" ? (
              <ContentManager pagesData={pagesData} reload={load} />
            ) : menu === "templates" ? (
              <TemplatesView />
            ) : menu === "clients" ? (
              <ClientsView clients={clients} onChanged={load} />
            ) : menu === "partners" ? (
              <PartnersView pagesData={pagesData} partnerUsers={partnerUsers} onChanged={load} />
            ) : menu === "emails" ? (
              <EmailComposer clients={clients} />
            ) : (
              <ContractView pagesData={pagesData} onSaved={load} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
