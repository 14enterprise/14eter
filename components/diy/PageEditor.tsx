"use client";

import { useState } from "react";
import type { SitePage, SiteItem } from "@/lib/site-templates";
import ImageField from "./ImageField";

const inputCls =
  "w-full bg-black/40 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all text-sm";

export default function PageEditor({
  page,
  onSave,
  onDelete,
}: {
  page: SitePage;
  onSave: (list: SitePage[], updated?: SitePage) => void;
  onDelete: (list: SitePage[]) => void;
}) {
  const [local, setLocal] = useState<SitePage>(page);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function set<K extends keyof SitePage>(key: K, value: SitePage[K]) {
    setLocal((p) => ({ ...p, [key]: value }));
    setError("");
    setNotice("");
  }

  function updateItem(i: number, patch: Partial<SiteItem>) {
    setLocal((p) => ({
      ...p,
      items: p.items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)),
    }));
  }

  async function save() {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/diy/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", page: local }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Failed to save this page.");
        return;
      }
      if (json.page) {
        setLocal(json.page);
        onSave(json.pages ?? [], json.page);
      } else if (Array.isArray(json.pages)) {
        const updated = json.pages.find((p: SitePage) => p.id === local.id);
        if (updated) setLocal(updated);
        onSave(json.pages);
      }
      setNotice("Page saved — your live site is updated.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm(`Delete "${local.title}"? This cannot be undone.`)) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/diy/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id: local.id }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Could not delete this page.");
        return;
      }
      onDelete(json.pages ?? []);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand mb-1">
            Page · {local.id}
          </p>
          <p className="font-bold text-lg">
            {local.title || "Untitled page"}
            <span className="text-gray-500 font-normal text-sm ml-2">
              /{local.slug}
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => void remove()}
          disabled={saving}
          className="text-xs font-semibold text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg px-3 py-2 disabled:opacity-50"
        >
          Delete page
        </button>
      </div>

      {notice && (
        <p className="text-sm text-green-400 bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3">
          {notice}
        </p>
      )}
      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <section className="bg-black/40 border border-gray-800 rounded-2xl p-5">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
          Page details
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">Page title</label>
            <input className={inputCls} value={local.title} onChange={(e) => set("title", e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">Menu label</label>
            <input className={inputCls} value={local.navLabel} onChange={(e) => set("navLabel", e.target.value)} placeholder="Shown in the menu" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-gray-500 mb-2">Hero heading</label>
            <input className={inputCls} value={local.heroTitle} onChange={(e) => set("heroTitle", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-gray-500 mb-2">Intro text</label>
            <textarea rows={4} className={`${inputCls} resize-y`} value={local.intro} onChange={(e) => set("intro", e.target.value)} />
          </div>
        </div>
      </section>

      <section className="bg-black/40 border border-gray-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">
            Page photos
          </h3>
          <button
            type="button"
            onClick={() => set("photos", [...(local.photos ?? []), ""])}
            className="text-xs font-bold text-brand hover:text-white transition"
          >
            + Add photo
          </button>
        </div>
        <div className="space-y-3">
          {(local.photos ?? []).length === 0 && (
            <p className="text-xs text-gray-500">
              No photos yet — add some to show a photo gallery on this page, just like homepage items.
            </p>
          )}
          {(local.photos ?? []).map((src, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <ImageField
                  value={src}
                  onChange={(v) =>
                    set("photos", (local.photos ?? []).map((p, idx) => (idx === i ? v : p)))
                  }
                  placeholder="Image URL or upload a photo"
                />
              </div>
              <button
                type="button"
                aria-label="Remove photo"
                onClick={() => set("photos", (local.photos ?? []).filter((_, idx) => idx !== i))}
                className="shrink-0 text-red-400 hover:text-red-300 font-bold text-sm border border-red-500/30 rounded-lg px-2.5 py-1.5 transition"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-black/40 border border-gray-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">
            Content &amp; items
          </h3>
          <button
            type="button"
            onClick={() => set("items", [...local.items, { name: "", desc: "", price: "", image: "", orderButton: true }])}
            className="text-xs font-bold text-brand hover:text-white transition"
          >
            + Add item
          </button>
        </div>
        <div className="space-y-3">
          {local.items.map((it, i) => (
            <div key={i} className="border border-gray-800 rounded-2xl p-3">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:items-center">
                <div className="sm:col-span-3">
                  <input className={inputCls} value={it.name} onChange={(e) => updateItem(i, { name: e.target.value })} placeholder="Name" />
                </div>
                <div className="sm:col-span-2">
                  <input className={inputCls} value={it.price ?? ""} onChange={(e) => updateItem(i, { price: e.target.value })} placeholder="Price (optional)" />
                </div>
                <div className="sm:col-span-6">
                  <input className={inputCls} value={it.desc} onChange={(e) => updateItem(i, { desc: e.target.value })} placeholder="Short description" />
                </div>
                <div className="sm:col-span-1 flex sm:justify-end">
                  <button
                    type="button"
                    aria-label={`Remove ${it.name || "item"}`}
                    onClick={() => set("items", local.items.filter((_, idx) => idx !== i))}
                    className="text-red-400 hover:text-red-300 font-bold text-sm border border-red-500/30 rounded-lg px-2.5 py-1.5 transition"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="mt-3">
                <ImageField value={it.image ?? ""} onChange={(v) => updateItem(i, { image: v })} placeholder="Image URL or upload a photo" />
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-gray-400">💬 Order via WhatsApp button</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={it.orderButton !== false}
                  aria-label={`Toggle order button for ${it.name || "item"}`}
                  onClick={() => updateItem(i, { orderButton: it.orderButton === false })}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition ${it.orderButton !== false ? "bg-brand" : "bg-gray-700"}`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${it.orderButton !== false ? "left-[22px]" : "left-0.5"}`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm bg-brand hover:bg-brand-dark shadow-lg shadow-brand/25 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Saving…
            </>
          ) : (
            <>💾 Save &amp; publish this page</>
          )}
        </button>
      </div>
    </div>
  );
}