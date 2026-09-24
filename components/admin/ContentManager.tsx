"use client";

import { FormEvent, useState } from "react";
import SectionEditor, { type Json } from "./SectionEditor";
import type { PageRow, SectionRow } from "./types";

const sectionIcons: Record<string, string> = {
  hero: "🏠",
  model: "🤝",
  process: "⚙️",
  partners: "🏢",
  contact: "✉️",
  footer: "📋",
  pageHero: "🖼️",
  story: "📖",
  values: "💎",
  ctaBanner: "📣",
  contactInfo: "📇",
  contactForm: "📝",
  contractTemplate: "📄",
};

export default function ContentManager({
  pagesData,
  reload,
}: {
  pagesData: PageRow[];
  reload: () => Promise<void>;
}) {
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [editing, setEditing] = useState<SectionRow | null>(null);
  const [draft, setDraft] = useState<Record<string, Json>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const currentPage =
    pagesData.find((p) => p.slug === selectedPage) ?? pagesData[0] ?? null;

  function openEditor(section: SectionRow) {
    setEditing(section);
    setDraft(structuredClone(section.content));
    setSaved(false);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    const res = await fetch("/api/admin/data", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editing.id, content: draft }),
    });
    setSaving(false);
    if (!res.ok) return;
    await reload();
    setSaved(true);
    setTimeout(() => setEditing(null), 800);
  }

  return (
    <div>
      <div className="mb-8 max-w-xs">
        <label
          htmlFor="page-select"
          className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2"
        >
          Select Page
        </label>
        <div className="relative">
          <select
            id="page-select"
            value={currentPage?.slug ?? ""}
            onChange={(e) => setSelectedPage(e.target.value)}
            className="w-full appearance-none bg-gray-900 border border-gray-700 hover:border-brand/50 focus:border-brand focus:ring-2 focus:ring-brand/40 outline-none rounded-xl px-4 py-3.5 pr-10 font-semibold text-white cursor-pointer transition-colors"
          >
            {pagesData.map((page) => (
              <option key={page.slug} value={page.slug} className="bg-gray-900 text-white">
                {page.title}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            ▾
          </span>
        </div>
      </div>

      {currentPage && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentPage.sections.map((section) => (
            <button
              key={section.id}
              onClick={() => openEditor(section)}
              className="group text-left bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-800 hover:border-brand/50 hover:-translate-y-1 transition-all duration-300 shadow-xl"
            >
              <div className="w-12 h-12 rounded-xl bg-brand/15 flex items-center justify-center text-2xl mb-4 group-hover:bg-brand/25 transition-colors">
                {sectionIcons[section.key] ?? "📄"}
              </div>
              <h3 className="font-bold text-lg group-hover:text-brand transition-colors">
                {section.label}
              </h3>
              <p className="text-xs uppercase tracking-widest text-gray-500 mt-1">
                key: {section.key}
              </p>
              <p className="text-sm text-gray-500 mt-3">
                Updated{" "}
                {section.updatedAt
                  ? new Date(section.updatedAt).toLocaleString()
                  : "—"}
              </p>
              <span className="inline-block mt-4 text-brand text-sm font-semibold group-hover:translate-x-1 transition-transform">
                Edit section →
              </span>
            </button>
          ))}
        </div>
      )}

      {editing && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setEditing(null)}
        >
          <form
            onSubmit={handleSave}
            className="w-full max-w-2xl max-h-[85vh] overflow-y-auto overscroll-contain bg-gray-900 border border-gray-700 rounded-2xl sm:rounded-3xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur border-b border-gray-800 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold truncate">Edit: {editing.label}</h2>
                <p className="text-xs text-gray-500 uppercase tracking-widest truncate">
                  {currentPage?.title} / {editing.key}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditing(null)}
                aria-label="Close editor"
                className="w-10 h-10 sm:w-9 sm:h-9 shrink-0 rounded-lg bg-gray-800 hover:bg-gray-700 transition text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="p-4 sm:p-6">
              <SectionEditor content={draft} onChange={setDraft} />
            </div>

            <div className="sticky bottom-0 bg-gray-900/95 backdrop-blur border-t border-gray-800 px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap items-center justify-end gap-3">
              {saved && (
                <span className="text-green-400 text-sm font-semibold mr-auto animate-pulse">
                  Saved ✓ — changes are live
                </span>
              )}
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="px-5 py-3 rounded-xl font-semibold text-sm bg-gray-800 border border-gray-700 hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-xl font-bold text-sm bg-brand hover:bg-brand-dark shadow-lg shadow-brand/25 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving…" : saved ? "Saved ✓" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
