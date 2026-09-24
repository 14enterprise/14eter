"use client";

import { useState } from "react";
import type { SitePage } from "@/lib/site-templates";
import TemplateStudio from "./TemplateStudio";
import PageEditor from "./PageEditor";

export default function SiteAdminShell({
  initialTemplateId,
  initialSiteContent,
  initialAppSlug,
  initialPages,
  hasApp,
  onSubdomain,
}: {
  initialTemplateId: string | null;
  initialSiteContent: string | null;
  initialAppSlug: string | null;
  initialPages: SitePage[];
  hasApp: boolean;
  onSubdomain: boolean;
}) {
  const [pages, setPages] = useState<SitePage[]>(initialPages ?? []);
  const [selected, setSelected] = useState<string>("home");

  const page = selected === "home" ? null : pages.find((p) => p.id === selected) ?? null;

  async function createPage() {
    const res = await fetch("/api/diy/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", title: "New page" }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(json.error ?? "Could not create a page.");
      return;
    }
    const list: SitePage[] = json.pages ?? [];
    setPages(list);
    const fresh = list.find((p) => !pages.some((q) => q.id === p.id));
    setSelected(fresh?.id ?? "home");
  }

  async function deletePage(id: string) {
    const target = pages.find((p) => p.id === id);
    if (!confirm(`Delete "${target?.navLabel ?? target?.title ?? "this page"}"? This cannot be undone.`))
      return;
    const res = await fetch("/api/diy/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(json.error ?? "Could not delete this page.");
      return;
    }
    setPages(json.pages ?? []);
    if (selected === id) setSelected("home");
  }

  const idleBtn =
    "w-full flex items-center gap-2 text-left text-[13px] font-semibold text-gray-400 hover:text-white hover:bg-white/5 rounded-xl px-3 py-2.5 transition";
  const activeBtn =
    "w-full flex items-center gap-2 text-left text-[13px] font-bold text-white bg-brand/15 border border-brand/40 rounded-xl px-3 py-2.5 transition";

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      <aside className="w-full lg:w-72 shrink-0 border border-gray-800 rounded-2xl bg-black/40 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-gray-500">
            Site pages
          </p>
          <span className="text-[11px] font-bold text-gray-500">
            {pages.length + 1} total
          </span>
        </div>
        <div className="p-2 space-y-1">
          <button
            type="button"
            onClick={() => setSelected("home")}
            className={selected === "home" ? activeBtn : idleBtn}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            Home
            <span className="ml-auto text-[10px] font-bold text-gray-500">
              always live
            </span>
          </button>

          {pages.map((p) => (
            <div key={p.id} className="group flex items-center">
              <button
                type="button"
                onClick={() => setSelected(p.id)}
                className={selected === p.id ? `${activeBtn} rounded-r-none` : `${idleBtn} rounded-r-none`}
              >
                <span className="h-1.5 w-1.5 rounded-full opacity-40" />
                <span className="truncate">{p.navLabel || p.title || p.slug}</span>
                <span className="ml-auto text-[10px] text-gray-600">/{p.slug}</span>
              </button>
              <button
                type="button"
                aria-label={`Delete ${p.navLabel || p.title}`}
                onClick={() => void deletePage(p.id)}
                className="opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl px-2.5 py-2.5 text-sm font-bold transition"
              >
                ✕
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => void createPage()}
            className="w-full text-[13px] font-bold text-brand hover:text-white border border-dashed border-brand/40 hover:border-brand rounded-xl px-3 py-2.5 mt-1 transition"
          >
            ＋ New page
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 w-full">
        {selected === "home" || !page ? (
          <TemplateStudio
            key="home-editor"
            initialTemplateId={initialTemplateId}
            initialSiteContent={initialSiteContent}
            initialAppSlug={initialAppSlug}
            initialPages={pages}
            hasApp={hasApp}
            onSubdomain={onSubdomain}
          />
        ) : (
          <PageEditor
            key={page.id}
            page={page}
            onSave={(list, updated) => {
              setPages(list);
              // Follow id changes when a rename changes the page URL.
              if (updated && updated.id !== selected) setSelected(updated.id);
            }}
            onDelete={(list) => {
              setPages(list);
              setSelected("home");
            }}
          />
        )}
      </div>
    </div>
  );
}