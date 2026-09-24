"use client";

import { useEffect, useState } from "react";
import {
  TEMPLATE_LAYOUTS,
  TEMPLATE_THEMES,
  type Category,
  type SiteTemplate,
} from "@/lib/site-templates";

const inputCls =
  "w-full bg-black/40 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all text-sm";

const labelCls = "block text-xs font-bold text-gray-500 mb-2";

type CategoryForm = { id: string; name: string; icon: string; tagline: string };
type TemplateForm = {
  id: string;
  category: string;
  name: string;
  tagline: string;
  description: string;
  theme: string;
  layout: string;
  itemsLabel: string;
  cta: string;
  image: string;
};

const emptyTemplateForm = (category: string): TemplateForm => ({
  id: "",
  category,
  name: "",
  tagline: "",
  description: "",
  theme: "aurora",
  layout: "grid",
  itemsLabel: "Items",
  cta: "Learn more",
  image: "",
});

function toTemplateForm(t: SiteTemplate): TemplateForm {
  return {
    id: t.id,
    category: t.category,
    name: t.name,
    tagline: t.tagline,
    description: t.description,
    theme: t.theme,
    layout: t.layout,
    itemsLabel: t.itemsLabel,
    cta: t.cta,
    image: t.image,
  };
}

export default function TemplatesView() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [templates, setTemplates] = useState<SiteTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const [catForm, setCatForm] = useState<CategoryForm>({ id: "", name: "", icon: "", tagline: "" });
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [tplForm, setTplForm] = useState<TemplateForm | null>(null);
  const [editingTpl, setEditingTpl] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/templates", { cache: "no-store" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(json.error ?? "Could not load templates.");
      setLoading(false);
      return;
    }
    setCategories(json.categories ?? []);
    setTemplates(json.templates ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function run(action: string, payload: Record<string, unknown>) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/admin/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Operation failed.");
        return false;
      }
      setCategories(json.categories ?? []);
      setTemplates(json.templates ?? []);
      return true;
    } finally {
      setBusy(false);
    }
  }

  async function saveCategory() {
    const ok = await run(editingCat ? "category.update" : "category.create", {
      id: editingCat ?? catForm.id,
      category: catForm,
    });
    if (ok) {
      setNotice(editingCat ? "Category updated." : "Category created.");
      setCatForm({ id: "", name: "", icon: "", tagline: "" });
      setEditingCat(null);
    }
  }

  async function removeCategory(id: string) {
    const cat = categories.find((c) => c.id === id);
    if (!confirm(`Delete category "${cat?.name ?? id}"?`)) return;
    const ok = await run("category.delete", { id });
    if (ok) {
      setNotice("Category deleted.");
      if (filter === id) setFilter("all");
    }
  }

  async function saveTemplate() {
    if (!tplForm) return;
    const ok = await run(editingTpl ? "template.update" : "template.create", {
      id: editingTpl ?? tplForm.id,
      template: tplForm,
    });
    if (ok) {
      setNotice(editingTpl ? "Template updated." : "Template created.");
      setTplForm(null);
      setEditingTpl(null);
    }
  }

  async function removeTemplate(id: string) {
    const t = templates.find((x) => x.id === id);
    if (!confirm(`Delete template "${t?.name ?? id}"? Published sites using it would break.`)) return;
    const ok = await run("template.delete", { id });
    if (ok) setNotice("Template deleted.");
  }

  const visible =
    filter === "all" ? templates : templates.filter((t) => t.category === filter);

  if (loading) return <p className="text-gray-500 animate-pulse">Loading templates…</p>;

  return (
    <div className="space-y-8">
      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          {error}
        </p>
      )}
      {notice && (
        <p className="text-sm text-green-400 bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3">
          {notice}
        </p>
      )}

      {/* Categories */}
      <section className="bg-gray-900/60 border border-gray-800 rounded-3xl p-6 md:p-8">
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-1">
          Categories
        </h2>
        <p className="font-bold text-xl mb-6">{categories.length} categories</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {categories.map((c) => (
            <div key={c.id} className="bg-black/40 border border-gray-800 rounded-2xl p-4">
              <p className="font-bold">
                {c.icon} {c.name}
              </p>
              <p className="text-xs text-gray-500 mt-1">{c.tagline || "—"}</p>
              <p className="text-[11px] text-gray-600 mt-1 font-mono">{c.id}</p>
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setEditingCat(c.id);
                    setCatForm({ id: c.id, name: c.name, icon: c.icon, tagline: c.tagline });
                  }}
                  className="text-xs font-bold text-brand hover:text-white border border-gray-700 hover:border-brand rounded-lg px-3 py-1.5 transition disabled:opacity-50"
                >
                  Edit
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void removeCategory(c.id)}
                  className="text-xs font-bold text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg px-3 py-1.5 transition disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-black/40 border border-gray-800 rounded-2xl p-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
            {editingCat ? `Edit category · ${editingCat}` : "New category"}
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>ID (slug)</label>
              <input
                className={inputCls}
                value={catForm.id}
                disabled={!!editingCat || busy}
                onChange={(e) => setCatForm((f) => ({ ...f, id: e.target.value }))}
                placeholder="e.g. healthcare"
              />
            </div>
            <div>
              <label className={labelCls}>Name</label>
              <input
                className={inputCls}
                value={catForm.name}
                disabled={busy}
                onChange={(e) => setCatForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Healthcare"
              />
            </div>
            <div>
              <label className={labelCls}>Icon (emoji)</label>
              <input
                className={inputCls}
                value={catForm.icon}
                disabled={busy}
                onChange={(e) => setCatForm((f) => ({ ...f, icon: e.target.value }))}
                placeholder="🏥"
              />
            </div>
            <div>
              <label className={labelCls}>Tagline</label>
              <input
                className={inputCls}
                value={catForm.tagline}
                disabled={busy}
                onChange={(e) => setCatForm((f) => ({ ...f, tagline: e.target.value }))}
                placeholder="Short description"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              type="button"
              disabled={busy}
              onClick={() => void saveCategory()}
              className="font-bold text-sm bg-brand hover:bg-brand-dark text-white rounded-xl px-6 py-3 transition disabled:opacity-50"
            >
              {editingCat ? "Save changes" : "Add category"}
            </button>
            {editingCat && (
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setEditingCat(null);
                  setCatForm({ id: "", name: "", icon: "", tagline: "" });
                }}
                className="text-sm font-semibold text-gray-400 hover:text-white border border-gray-700 rounded-xl px-6 py-3 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Templates */}
      <section className="bg-gray-900/60 border border-gray-800 rounded-3xl p-6 md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-1">
              Templates
            </h2>
            <p className="font-bold text-xl">{templates.length} templates</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-black/40 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="all" className="bg-gray-900">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-gray-900">
                  {c.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={busy || categories.length === 0}
              onClick={() => {
                setEditingTpl(null);
                setTplForm(emptyTemplateForm(filter === "all" ? categories[0]?.id ?? "" : filter));
              }}
              className="font-bold text-sm bg-brand hover:bg-brand-dark text-white rounded-xl px-5 py-2.5 transition disabled:opacity-50"
            >
              ＋ New template
            </button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {visible.map((t) => (
            <div key={t.id} className="bg-black/40 border border-gray-800 rounded-2xl overflow-hidden">
              {t.image ? (
                <div className="h-36 overflow-hidden">
                  <img src={t.image} alt={t.name} className="w-full h-full object-cover" loading="lazy" />
                </div>
              ) : null}
              <div className="p-4">
                <p className="font-bold text-lg">{t.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t.tagline}</p>
                <p className="text-[11px] text-gray-600 mt-1 font-mono">
                  {t.id} · {t.theme} · {t.layout}
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setEditingTpl(t.id);
                      setTplForm(toTemplateForm(t));
                    }}
                    className="text-xs font-bold text-brand hover:text-white border border-gray-700 hover:border-brand rounded-lg px-3 py-1.5 transition disabled:opacity-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void removeTemplate(t.id)}
                    className="text-xs font-bold text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg px-3 py-1.5 transition disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {visible.length === 0 && (
            <p className="text-sm text-gray-500 sm:col-span-2">No templates in this view yet.</p>
          )}
        </div>

        {tplForm && (
          <div className="bg-black/40 border border-brand/40 rounded-2xl p-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
              {editingTpl ? `Edit template · ${editingTpl}` : "New template"}
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>ID (slug)</label>
                <input
                  className={inputCls}
                  value={tplForm.id}
                  disabled={!!editingTpl || busy}
                  onChange={(e) => setTplForm((f) => (f ? { ...f, id: e.target.value } : f))}
                  placeholder="e.g. medspa"
                />
              </div>
              <div>
                <label className={labelCls}>Category</label>
                <select
                  className={inputCls}
                  value={tplForm.category}
                  disabled={busy}
                  onChange={(e) => setTplForm((f) => (f ? { ...f, category: e.target.value } : f))}
                >
                  <option value="" disabled className="bg-gray-900">Select…</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-gray-900">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Name</label>
                <input
                  className={inputCls}
                  value={tplForm.name}
                  disabled={busy}
                  onChange={(e) => setTplForm((f) => (f ? { ...f, name: e.target.value } : f))}
                  placeholder="e.g. MedSpa"
                />
              </div>
              <div>
                <label className={labelCls}>Tagline</label>
                <input
                  className={inputCls}
                  value={tplForm.tagline}
                  disabled={busy}
                  onChange={(e) => setTplForm((f) => (f ? { ...f, tagline: e.target.value } : f))}
                  placeholder="Short tagline"
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Description</label>
                <textarea
                  rows={2}
                  className={`${inputCls} resize-y`}
                  value={tplForm.description}
                  disabled={busy}
                  onChange={(e) => setTplForm((f) => (f ? { ...f, description: e.target.value } : f))}
                  placeholder="Longer description shown on the card"
                />
              </div>
              <div>
                <label className={labelCls}>Theme</label>
                <select
                  className={inputCls}
                  value={tplForm.theme}
                  disabled={busy}
                  onChange={(e) => setTplForm((f) => (f ? { ...f, theme: e.target.value } : f))}
                >
                  {TEMPLATE_THEMES.map((th) => (
                    <option key={th} value={th} className="bg-gray-900">
                      {th}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Layout</label>
                <select
                  className={inputCls}
                  value={tplForm.layout}
                  disabled={busy}
                  onChange={(e) => setTplForm((f) => (f ? { ...f, layout: e.target.value } : f))}
                >
                  {TEMPLATE_LAYOUTS.map((l) => (
                    <option key={l} value={l} className="bg-gray-900">
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Items label</label>
                <input
                  className={inputCls}
                  value={tplForm.itemsLabel}
                  disabled={busy}
                  onChange={(e) => setTplForm((f) => (f ? { ...f, itemsLabel: e.target.value } : f))}
                  placeholder="e.g. Services"
                />
              </div>
              <div>
                <label className={labelCls}>CTA button text</label>
                <input
                  className={inputCls}
                  value={tplForm.cta}
                  disabled={busy}
                  onChange={(e) => setTplForm((f) => (f ? { ...f, cta: e.target.value } : f))}
                  placeholder="e.g. Get a quote"
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Preview image URL</label>
                <input
                  className={inputCls}
                  value={tplForm.image}
                  disabled={busy}
                  onChange={(e) => setTplForm((f) => (f ? { ...f, image: e.target.value } : f))}
                  placeholder="https://…"
                />
                {tplForm.image ? (
                  <div className="h-36 mt-3 rounded-xl overflow-hidden border border-gray-800">
                    <img src={tplForm.image} alt="preview" className="w-full h-full object-cover" />
                  </div>
                ) : null}
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                disabled={busy}
                onClick={() => void saveTemplate()}
                className="font-bold text-sm bg-brand hover:bg-brand-dark text-white rounded-xl px-6 py-3 transition disabled:opacity-50"
              >
                {editingTpl ? "Save changes" : "Add template"}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setTplForm(null);
                  setEditingTpl(null);
                }}
                className="text-sm font-semibold text-gray-400 hover:text-white border border-gray-700 rounded-xl px-6 py-3 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
