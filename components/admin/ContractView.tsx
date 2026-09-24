"use client";

import { useState } from "react";
import SectionEditor, { type Json } from "./SectionEditor";
import type { PageRow } from "./types";
import type { ContractTemplateContent } from "@/lib/content-defaults";

export default function ContractView({
  pagesData,
  onSaved,
}: {
  pagesData: PageRow[];
  onSaved: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Record<string, Json>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const section = pagesData
    .flatMap((p) => p.sections)
    .find((s) => s.key === "contractTemplate");

  if (!section) {
    return (
      <p className="text-gray-500">
        No contract template found — it should seed automatically. Try reloading.
      </p>
    );
  }

  const c = section.content as unknown as ContractTemplateContent;

  async function openEditor() {
    setDraft(structuredClone(section!.content));
    setSaved(false);
    setEditing(true);
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/admin/data", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: section!.id, content: draft }),
    });
    setSaving(false);
    if (!res.ok) return;
    await onSaved();
    setSaved(true);
    setTimeout(() => setEditing(false), 800);
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">
          Editable agreement template — placeholders in [BRACKETS] are filled per client.
        </p>
        <button
          onClick={openEditor}
          className="shrink-0 ml-4 px-5 py-2.5 rounded-xl font-bold text-sm bg-brand hover:bg-brand-dark shadow-lg shadow-brand/25 transition"
        >
          Edit Template
        </button>
      </div>

      <article className="bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 md:p-10 shadow-xl">
        <h2 className="text-2xl font-black text-center text-white mb-6 uppercase tracking-wide">
          {c.title}
        </h2>
        <p className="text-gray-400 leading-relaxed mb-8 text-sm">{c.intro}</p>
        <ol className="space-y-6">
          {(c.clauses ?? []).map((clause, i) => (
            <li key={i}>
              <h3 className="font-bold text-white mb-1.5">{clause.heading}</h3>
              <p className="text-gray-400 leading-relaxed text-sm">{clause.body}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10 pt-6 border-t border-gray-800 whitespace-pre-line text-xs text-gray-500 leading-relaxed">
          {c.closing}
        </div>
      </article>

      {editing && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setEditing(false)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSave();
            }}
            className="w-full max-w-2xl max-h-[85vh] overflow-y-auto overscroll-contain bg-gray-900 border border-gray-700 rounded-2xl sm:rounded-3xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur border-b border-gray-800 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
              <h2 className="text-base sm:text-lg font-bold truncate min-w-0">Edit: Agreement Template</h2>
              <button
                type="button"
                onClick={() => setEditing(false)}
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
                  Saved ✓
                </span>
              )}
              <button
                type="button"
                onClick={() => setEditing(false)}
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
