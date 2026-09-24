"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  CATEGORIES as STATIC_CATEGORIES,
  TEMPLATES as STATIC_TEMPLATES,
  defaultContent,
  getTemplate as getStaticTemplate,
  normalizeContent,
  type Category,
  type SiteContent,
  type SiteItem,
  type SiteTemplate,
} from "@/lib/site-templates";
import { PAYSTACK_PLANS } from "@/lib/paystack";
import ImageField from "./ImageField";
import { renderSite, slugify } from "@/lib/app-factory";
import type { SitePage } from "@/lib/site-templates";

function parseInitialContent(raw: string | null, t: SiteTemplate): SiteContent {
  if (!raw) return defaultContent(t);
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return normalizeContent(parsed, t);
  } catch {}
  return defaultContent(t);
}

const inputCls =
  "w-full bg-black/40 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all text-sm";

export default function TemplateStudio({
  initialTemplateId,
  initialSiteContent,
  initialAppSlug,
  initialPages,
  hasApp,
  onSubdomain = false,
}: {
  initialTemplateId: string | null;
  initialSiteContent: string | null;
  initialAppSlug: string | null;
  initialPages?: SitePage[];
  hasApp: boolean;
  onSubdomain?: boolean;
}) {
  const initialTemplate = getStaticTemplate(initialTemplateId ?? "");
  const [template, setTemplate] = useState<SiteTemplate | null>(initialTemplate);
  const [content, setContent] = useState<SiteContent>(
    initialTemplate ? parseInitialContent(initialSiteContent, initialTemplate) : defaultContent(STATIC_TEMPLATES[0])
  );
  const [categoryId, setCategoryId] = useState<string | null>(
    initialTemplate?.category ?? null
  );
  const [categories, setCategories] = useState<Category[]>(STATIC_CATEGORIES);
  const [allTemplates, setAllTemplates] = useState<SiteTemplate[]>(STATIC_TEMPLATES);
  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c])),
    [categories]
  );
  function findTemplate(id: string): SiteTemplate | null {
    return allTemplates.find((t) => t.id === id) ?? getStaticTemplate(id);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/templates", { cache: "no-store" });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || cancelled) return;
        if (Array.isArray(json.categories) && json.categories.length > 0) {
          setCategories(json.categories);
        }
        if (Array.isArray(json.templates) && json.templates.length > 0) {
          const list = json.templates as SiteTemplate[];
          setAllTemplates(list);
          // Reconcile: the saved template may only exist in the database.
          setTemplate((prev) => {
            if (prev || !initialTemplateId) return prev;
            const match = list.find((t) => t.id === initialTemplateId) ?? null;
            if (match) {
              setCategoryId(match.category);
              setContent(parseInitialContent(initialSiteContent, match));
            }
            return match;
          });
        }
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [appSlug, setAppSlug] = useState(initialAppSlug ?? "");
  const [hasDeployedApp, setHasDeployedApp] = useState(hasApp);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [preview, setPreview] = useState<{ t: SiteTemplate; html: string } | null>(null);
  const [subscription, setSubscription] = useState<{ status: string; plan: string; expiresAt: number; isActive: boolean } | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [pendingPublish, setPendingPublish] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const publishRef = useRef<() => Promise<void>>(async () => {});

  useEffect(() => {
    async function fetchSubscription() {
      try {
        const res = await fetch("/api/user/subscription");
        if (res.ok) {
          const data = await res.json();
          setSubscription(data);
        }
      } catch {}
    }
    fetchSubscription();
    function onSubUpdated() {
      fetchSubscription();
    }
    function onAutoPublish() {
      void publishRef.current();
    }
    window.addEventListener("subscription-updated", onSubUpdated);
    window.addEventListener("diy-auto-publish", onAutoPublish);
    return () => {
      window.removeEventListener("subscription-updated", onSubUpdated);
      window.removeEventListener("diy-auto-publish", onAutoPublish);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 6000);
    return () => window.clearTimeout(t);
  }, [toast]);

  function openPreview(t: SiteTemplate, withContent?: SiteContent) {
    const sample = withContent ?? defaultContent(t);
    const html = renderSite(t, sample, `${slugify(sample.brand || "myapp")}.14eter.org`);
    setPreview({
      t,
      html,
    });
  }

  function set<K extends keyof SiteContent>(key: K, value: SiteContent[K]) {
    setContent((c) => ({ ...c, [key]: value }));
    setError("");
    setNotice("");
  }

  function useTemplate(t: SiteTemplate) {
    setTemplate(t);
    setCategoryId(t.category);
    setContent((c) => {
      const base = defaultContent(t);
      return {
        ...base,
        brand: c.brand,
        email: c.email,
        phone: c.phone,
        address: c.address,
        hours: c.hours,
        cta: c.cta || t.cta,
      };
    });
    setError("");
    setNotice(
      hasDeployedApp
        ? `Template switched to ${t.name}. Press 'Save & republish' to update your live site.`
        : ""
    );
    if (hasDeployedApp) {
      setToast({ type: "success", message: `✨ Template changed to ${t.name}. Click "Save & republish" to update your live site.` });
    }
  }

  function updateItem(i: number, patch: Partial<SiteItem>) {
    setContent((c) => ({
      ...c,
      items: c.items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)),
    }));
  }

  async function publish() {
    if (!template) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/diy/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: template.id, content, pages: initialPages ?? [] }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 402 && json.requiresSubscription) {
          setSubscription(json.subscription);
          setShowSubscriptionModal(true);
          setPendingPublish(true);
          return;
        }
        setError(json.error ?? "Failed to publish your site. Please try again.");
        return;
      }
      setAppSlug(json.slug);
      setHasDeployedApp(true);
      setNotice(`Published — your site is live at ${json.slug}.14eter.org`);
      setToast({ type: "success", message: `🎉 Site published! Live at ${json.slug}.14eter.org` });
    } finally {
      setSaving(false);
    }
  }

  publishRef.current = publish;

  async function saveDraft() {
    if (!template) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/diy/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: template.id, content, draft: true }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Failed to save your draft. Please try again.");
        return;
      }
      setNotice("Draft saved. Use 'Save & republish' to update your live site.");
    } finally {
      setSaving(false);
    }
  }

  const previewModal = preview ? createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-3xl h-[85vh] flex flex-col bg-gray-950 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-gray-800">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand mb-0.5">
              Template preview · {preview.t.name}
            </p>
            <p className="text-sm text-gray-400">{preview.t.tagline}</p>
          </div>
          <button
            type="button"
            onClick={() => setPreview(null)}
            className="text-gray-400 hover:text-white font-bold text-xl px-2"
            aria-label="Close preview"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 bg-white">
          <iframe
            title={`${preview.t.name} preview`}
            srcDoc={preview.html}
            className="w-full h-full border-0"
            sandbox="allow-scripts"
          />
        </div>
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-t border-gray-800">
          <p className="text-xs text-gray-500">
            Sample content is shown — your own text and photos will fill it in.
          </p>
          <button
            type="button"
            onClick={() => {
              useTemplate(preview.t);
              setPreview(null);
            }}
            className="inline-block px-6 py-3 rounded-xl font-bold text-sm bg-brand hover:bg-brand-dark text-white transition"
          >
            Use this template
          </button>
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  const subscriptionModal = showSubscriptionModal ? createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-gray-950 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Subscription Required</h3>
            <button onClick={() => { setShowSubscriptionModal(false); setPendingPublish(false); }} className="text-gray-400 hover:text-white text-xl">✕</button>
          </div>
          <p className="text-gray-400 mb-6">To publish your site and get a custom subdomain, you need an active subscription.</p>
          <div className="space-y-3 mb-6">
            {(["monthly", "sixMonths", "yearly"] as const).map((key) => {
              const plan = PAYSTACK_PLANS[key];
              return (
                <button
                  key={key}
                  onClick={async () => {
                    try {
                      window.sessionStorage.setItem("diy_pending_publish", "1");
                    } catch {}
                    setShowSubscriptionModal(false);
                    setSaving(true);
                    try {
                      const res = await fetch("/api/paystack/checkout", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ plan: key }),
                      });
                      const json = await res.json();
                      if (json.authorizationUrl) {
                        window.location.href = json.authorizationUrl;
                      } else {
                        setError(json.error ?? "Failed to start checkout");
                      }
                    } catch {
                      setError("Failed to start checkout");
                    } finally {
                      setSaving(false);
                    }
                  }}
                  disabled={saving}
                  className="w-full text-left p-4 bg-gray-900 border border-gray-700 rounded-xl hover:border-brand hover:bg-gray-800 transition flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold">{plan.label}</p>
                    <p className="text-xs text-gray-500">{plan.name} billing</p>
                  </div>
                  <span className="text-brand font-bold">Select</span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 text-center">Payments powered by Paystack. Secure & encrypted.</p>
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  const toastModal = toast ? createPortal(
    <div className="fixed bottom-6 right-6 z-[120] animate-slideUp">
      <div className={`px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[280px] max-w-md ${
        toast.type === "success" ? "bg-green-600 text-white border border-green-500" : "bg-red-600 text-white border border-red-500"
      }`}>
        <span className="text-lg">{toast.type === "success" ? "✓" : "✕"}</span>
        <p className="font-medium">{toast.message}</p>
        <button onClick={() => setToast(null)} className="ml-auto text-white/80 hover:text-white font-bold text-xl leading-none">✕</button>
      </div>
    </div>,
    document.body
  ) : null;

  if (!template) {
    const categoryTemplates = categoryId ? allTemplates.filter((t) => t.category === categoryId) : [];
    return (
      <div>
        {previewModal}
        {subscriptionModal}
        {toastModal}
        <label
          htmlFor="diy-category"
          className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2"
        >
          Step 1 · Choose your category
        </label>
        <select
          id="diy-category"
          value={categoryId ?? ""}
          onChange={(e) => setCategoryId(e.target.value || null)}
          className={`w-full bg-black/40 border border-gray-700 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all appearance-none ${
            categoryId ? "" : "text-gray-500"
          }`}
        >
          <option value="" disabled className="text-gray-400">
            Select a category…
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id} className="bg-gray-900 text-white">
              {c.icon} {c.name}
            </option>
          ))}
        </select>

        {categoryId && (
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-4">
              Step 2 · Pick a template
              <span className="block text-sm font-normal text-gray-500 mt-1">
                {categoryMap[categoryId]?.tagline}
              </span>
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {categoryTemplates.map((t) => (
                <div
                  key={t.id}
                  className="bg-black/40 border border-gray-800 rounded-2xl overflow-hidden hover:border-brand/40 transition"
                >
                  <div className="h-48 relative overflow-hidden">
                    <img
                      src={t.image}
                      alt={`${t.name} template preview`}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <span className="text-[10px] uppercase tracking-widest text-gray-400 border border-gray-700 rounded-full px-2 py-0.5">
                        {LAYOUT_LABEL[t.layout]}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-bold text-lg">{t.name}</p>
                    </div>
                    <p className="text-sm text-gray-400 leading-snug mb-1">{t.tagline}</p>
                    <p className="text-xs text-gray-500 mb-4">{t.description}</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openPreview(t)}
                        className="flex-1 font-bold text-sm border border-gray-700 text-white rounded-xl px-4 py-3 transition hover:border-brand hover:text-brand"
                      >
                        Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => useTemplate(t)}
                        className="flex-1 font-bold text-sm bg-brand hover:bg-brand-dark text-white rounded-xl px-4 py-3 transition"
                      >
                        Use this template
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {previewModal}
      {subscriptionModal}
      {toastModal}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand mb-1">
            {categoryMap[template.category]?.icon} {categoryMap[template.category]?.name} · {template.name}
          </p>
          <p className="font-bold text-lg">{template.tagline}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs font-semibold text-gray-400">
            Change template
          </label>
          <select
            value={template.id}
            onChange={(e) => {
              const t = findTemplate(e.target.value);
              if (t) useTemplate(t);
            }}
            className="bg-black/40 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand transition-all"
          >
            {allTemplates.filter((t) => t.category === template.category).map((t) => (
              <option key={t.id} value={t.id} className="bg-gray-900 text-white">
                {t.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => openPreview(template, content)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold border border-gray-700 hover:border-brand hover:text-brand transition"
          >
            👁 Preview
          </button>
          <button
            type="button"
            onClick={() => setTemplate(null)}
            className="text-xs font-semibold text-gray-400 hover:text-white underline underline-offset-2"
          >
            All categories →
          </button>
        </div>
      </div>

      <div className="mb-6">
        {subscription?.isActive ? (
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide border rounded-full px-3 py-1.5 bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
            ★ Premium{subscription.plan ? ` · ${subscription.plan}` : ""} — publish unlocked
          </span>
        ) : subscription?.status === "expired" ? (
          <button
            type="button"
            onClick={() => setShowSubscriptionModal(true)}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide border rounded-full px-3 py-1.5 bg-red-500/10 text-red-300 border-red-500/30 hover:border-red-400 transition"
          >
            Subscription expired — renew to keep publishing
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowSubscriptionModal(true)}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide border rounded-full px-3 py-1.5 bg-amber-500/10 text-amber-300 border-amber-500/30 hover:border-amber-400 transition"
          >
            Free plan — subscribe to publish your site
          </button>
        )}
      </div>

      {hasDeployedApp && (
        <div className="mb-6 bg-black/40 border border-green-500/30 rounded-2xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-green-400 mb-1">
                ● Live — your site is deployed
              </p>
              <p className="font-bold text-lg">{appSlug}.14eter.org</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={onSubdomain ? "./" : `/app/${appSlug}`}
                className="inline-block px-5 py-3 rounded-xl text-sm font-bold bg-brand hover:bg-brand-dark transition"
              >
                Open my site ↗
              </a>
              {!onSubdomain && (
                <a
                  href={`/app/${appSlug}/admin`}
                  className="inline-block px-5 py-3 rounded-xl text-sm font-semibold border border-gray-700 hover:border-brand hover:text-brand transition"
                >
                  Site admin →
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {notice && (
        <p className="mb-5 text-sm text-green-400 bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3">
          {notice}
        </p>
      )}
      {error && (
        <p className="mb-5 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <div className="space-y-6">
        <section className="bg-black/40 border border-gray-800 rounded-2xl p-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
            Brand &amp; hero
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Labeled label="Business / site name">
              <input className={inputCls} value={content.brand} onChange={(e) => set("brand", e.target.value)} placeholder="Your Brand" />
            </Labeled>
            <Labeled label="Tagline">
              <input className={inputCls} value={content.tagline} onChange={(e) => set("tagline", e.target.value)} />
            </Labeled>
            <Labeled label="Hero title">
              <input className={inputCls} value={content.heroTitle} onChange={(e) => set("heroTitle", e.target.value)} />
            </Labeled>
            <Labeled label="Hero subtitle">
              <input className={inputCls} value={content.heroSub} onChange={(e) => set("heroSub", e.target.value)} />
            </Labeled>
            <Labeled label="Main button text">
              <input className={inputCls} value={content.cta} onChange={(e) => set("cta", e.target.value)} />
            </Labeled>
          </div>
          <div className="mt-4">
            <label className="block text-xs font-bold text-gray-500 mb-2">About your business</label>
            <textarea className={`${inputCls} resize-y`} rows={4} value={content.about} onChange={(e) => set("about", e.target.value)} placeholder="Short paragraph introducing what you do…" />
          </div>
        </section>

        <section className="bg-black/40 border border-gray-800 rounded-2xl p-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
            Contact details
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Labeled label="Phone">
              <input className={inputCls} value={content.phone} onChange={(e) => set("phone", e.target.value)} />
            </Labeled>
            <Labeled label="Email">
              <input className={inputCls} type="email" value={content.email} onChange={(e) => set("email", e.target.value)} />
            </Labeled>
            <Labeled label="Opening hours">
              <input className={inputCls} value={content.hours} onChange={(e) => set("hours", e.target.value)} />
            </Labeled>
            <Labeled label="Location / address">
              <input className={inputCls} value={content.address} onChange={(e) => set("address", e.target.value)} />
            </Labeled>
          </div>
        </section>

        <section className="bg-black/40 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">
              {template.itemsLabel}
            </h3>
            <button
              type="button"
              onClick={() => set("items", [...content.items, { name: "", desc: "", price: "", image: "", orderButton: true }])}
              className="text-xs font-bold text-brand hover:text-white transition"
            >
              + Add item
            </button>
          </div>
          <div className="space-y-3">
            {content.items.map((it, i) => (
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
                      onClick={() => set("items", content.items.filter((_, idx) => idx !== i))}
                      className="text-red-400 hover:text-red-300 font-bold text-sm border border-red-500/30 rounded-lg px-2.5 py-1.5 transition"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="mt-3">
                  <ImageField
                    value={it.image ?? ""}
                    onChange={(v) => updateItem(i, { image: v })}
                    placeholder="Image URL or upload a photo"
                  />
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

        <section className="bg-black/40 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Social links</h3>
            <button
              type="button"
              onClick={() => set("socials", [...content.socials, { label: "", url: "" }])}
              className="text-xs font-bold text-brand hover:text-white transition"
            >
              + Add social
            </button>
          </div>
          <div className="space-y-3">
            {content.socials.map((s, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:items-center">
                <div className="sm:col-span-3">
                  <input className={inputCls} value={s.label} onChange={(e) => set("socials", content.socials.map((v, idx) => (idx === i ? { ...v, label: e.target.value } : v)))} placeholder="Label e.g. Instagram" />
                </div>
                <div className="sm:col-span-8">
                  <input className={inputCls} value={s.url} onChange={(e) => set("socials", content.socials.map((v, idx) => (idx === i ? { ...v, url: e.target.value } : v)))} placeholder="https://…" />
                </div>
                <div className="sm:col-span-1 flex sm:justify-end">
                  <button
                    type="button"
                    aria-label={`Remove ${s.label || "social"}`}
                    onClick={() => set("socials", content.socials.filter((_, idx) => idx !== i))}
                    className="text-red-400 hover:text-red-300 font-bold text-sm border border-red-500/30 rounded-lg px-2.5 py-1.5 transition"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => void publish()}
            disabled={saving}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm bg-brand hover:bg-brand-dark shadow-lg shadow-brand/25 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Publishing…
              </>
            ) : (
              <>🚀 {hasDeployedApp ? "Save & republish" : "Publish my site"}</>
            )}
          </button>
          {hasDeployedApp && (
            <button
              type="button"
              onClick={() => void saveDraft()}
              disabled={saving}
              className="px-6 py-3.5 rounded-xl text-sm font-semibold bg-gray-900 border border-gray-700 hover:border-brand hover:text-brand transition disabled:opacity-50"
            >
              Save draft
            </button>
          )}
          <p className="text-xs text-gray-500">
            Publishing builds your own interactive site at{" "}
            <span className="text-brand">yourbrand.14eter.org</span> instantly.
          </p>
        </div>
      </div>
    </div>
  );
}

const THEME_SWATCH: Record<string, { bg: string; primary: string }> = {
  aurora: { bg: "#0e0f1d", primary: "#7c6cf6" },
  forest: { bg: "#08120c", primary: "#34d399" },
  ember: { bg: "#170d09", primary: "#fb923c" },
  ocean: { bg: "#06151b", primary: "#2dd4bf" },
  paper: { bg: "#faf8f4", primary: "#b45309" },
  royal: { bg: "#100a18", primary: "#e879f9" },
};

const LAYOUT_LABEL: Record<string, string> = {
  grid: "Cards",
  list: "List",
  splash: "Splash",
  gallery: "Gallery",
};

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 mb-2">{label}</label>
      {children}
    </div>
  );
}