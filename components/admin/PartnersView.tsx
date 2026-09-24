"use client";

import { ReactNode, useEffect, useState } from "react";
import type { PageRow, PartnerUserRow } from "./types";

type Draft = {
  name: string;
  tag: string;
  website: string;
  color: string;
  logo: string;
};

type PartnerSection = { id: number; pageTitle: string; pageSlug: string };

const EMPTY: Draft = { name: "", tag: "", website: "", color: "", logo: "" };

const inputCls =
  "w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all";

function normalize(p: unknown): Draft {
  const rec = (p && typeof p === "object" ? p : {}) as Record<string, unknown>;
  return {
    name: String(rec.name ?? ""),
    tag: String(rec.tag ?? ""),
    website: String(rec.website ?? ""),
    color: String(rec.color ?? ""),
    logo: String(rec.logo ?? ""),
  };
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function PartnersView({
  pagesData,
  partnerUsers,
  onChanged,
}: {
  pagesData: PageRow[];
  partnerUsers: PartnerUserRow[];
  onChanged: () => Promise<void>;
}) {
  const sections: PartnerSection[] = pagesData.flatMap((p) =>
    p.sections
      .filter((s) => s.key === "partners")
      .map((s) => ({ id: s.id, pageTitle: p.title, pageSlug: p.slug }))
  );

  const [drafts, setDrafts] = useState<Record<number, Draft[]>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );

  useEffect(() => {
    setDrafts((prev) => {
      const next = { ...prev };
      for (const s of sections) {
        if (!(s.id in next)) {
          const section = pagesData
            .flatMap((p) => p.sections)
            .find((sec) => sec.id === s.id);
          next[s.id] = ((section?.content.partners ?? []) as unknown[]).map(normalize);
        }
      }
      return next;
    });
  }, [pagesData]);

  const allSites = pagesData.flatMap((p) =>
    p.sections
      .filter((s) => s.key === "partners")
      .flatMap((s) => ((s.content.partners ?? []) as Record<string, unknown>[]).filter((x) => x.name))
  );
  const withSite = allSites.filter((p) => p.website).length;

  function setField(sectionId: number, index: number, field: keyof Draft, value: string) {
    setDrafts((d) => {
      const list = [...(d[sectionId] ?? [])];
      list[index] = { ...list[index], [field]: value };
      return { ...d, [sectionId]: list };
    });
  }

  function addPartner(sectionId: number) {
    setDrafts((d) => ({
      ...d,
      [sectionId]: [...(d[sectionId] ?? []), { ...EMPTY }],
    }));
  }

  function removePartner(sectionId: number, index: number) {
    setDrafts((d) => ({
      ...d,
      [sectionId]: (d[sectionId] ?? []).filter((_, i) => i !== index),
    }));
  }

  async function saveList(sectionId: number) {
    const list = drafts[sectionId] ?? [];
    if (list.length === 0 || !list.some((p) => p.name.trim())) {
      setMessage({ type: "err", text: "Add at least one partner with a name." });
      return;
    }
    setSavingId(sectionId);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: sectionId, partners: list }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setMessage({ type: "err", text: json.error ?? "Failed to save." });
      } else {
        setMessage({ type: "ok", text: "Partner list saved — live on the site." });
        setDrafts((d) => {
          const next = { ...d };
          delete next[sectionId];
          return next;
        });
        await onChanged();
      }
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 sm:p-5">
          <p className="text-2xl sm:text-3xl font-black text-white">{allSites.length}</p>
          <p className="text-[10px] sm:text-xs uppercase tracking-widest text-gray-500 mt-1">
            Partner Sites
          </p>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 sm:p-5">
          <p className="text-2xl sm:text-3xl font-black text-green-400">{partnerUsers.length}</p>
          <p className="text-[10px] sm:text-xs uppercase tracking-widest text-gray-500 mt-1">
            Registered Partners
          </p>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 sm:p-5">
          <p className="text-2xl sm:text-3xl font-black text-brand">{withSite}</p>
          <p className="text-[10px] sm:text-xs uppercase tracking-widest text-gray-500 mt-1">
            Sites With Link
          </p>
        </div>
      </div>

      {message && (
        <p
          className={`mb-6 text-sm rounded-xl px-4 py-3 border ${
            message.type === "ok"
              ? "text-green-400 bg-green-500/10 border-green-500/30"
              : "text-red-400 bg-red-500/10 border-red-500/30"
          }`}
        >
          {message.text}
        </p>
      )}

      <section className="mb-10">
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-1">
          Partner Sites (Edit / Add / Delete)
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Changes apply to each page&apos;s marquee and go live as soon as you save.
        </p>

        {sections.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No partners section found — check Content Management.
          </p>
        ) : (
          <div className="space-y-6">
            {sections.map((sec) => {
              const list = drafts[sec.id] ?? [];
              return (
                <div
                  key={sec.id}
                  className="bg-gray-900/30 border border-gray-800 rounded-2xl p-5 md:p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                    <div>
                      <p className="font-bold text-white flex items-center gap-2">
                        {sec.pageTitle}
                        <span className="text-[10px] uppercase tracking-widest bg-gray-800 border border-gray-700 rounded-full px-2 py-0.5 text-gray-400">
                          marquee
                        </span>
                      </p>
                      <p className="text-xs text-gray-500">section id {sec.id}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void saveList(sec.id)}
                      disabled={savingId === sec.id}
                      className="sm:ml-auto px-5 py-2.5 rounded-xl font-bold text-sm bg-brand hover:bg-brand-dark shadow-lg shadow-brand/25 transition disabled:opacity-50"
                    >
                      {savingId === sec.id ? "Saving…" : "Save Partner List"}
                    </button>
                  </div>

                  <div>
                    {list.length === 0 && (
                      <p className="text-gray-500 text-sm">No partners in this list yet.</p>
                    )}
                    {list.map((p, i) => (
                      <div
                        key={i}
                        className="py-5 border-b border-gray-800 first:pt-0 last:border-b-0"
                      >
                        <div className="flex flex-wrap items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-brand/15 flex items-center justify-center font-black text-brand shrink-0">
                            {p.name.charAt(0).toUpperCase() || "·"}
                          </div>
                          <div className="flex-1 grid sm:grid-cols-2 lg:grid-cols-3 gap-3 min-w-[200px]">
                            <Field label="Name *">
                              <input
                                className={inputCls}
                                value={p.name}
                                placeholder="Company name"
                                onChange={(e) => setField(sec.id, i, "name", e.target.value)}
                              />
                            </Field>
                            <Field label="Tag">
                              <input
                                className={inputCls}
                                value={p.tag}
                                placeholder="Fintech"
                                onChange={(e) => setField(sec.id, i, "tag", e.target.value)}
                              />
                            </Field>
                            <Field label="Website (click to preview)">
                              <input
                                className={inputCls}
                                value={p.website}
                                placeholder="https://company.com"
                                onChange={(e) => setField(sec.id, i, "website", e.target.value)}
                              />
                            </Field>
                            <Field label="Logo image URL (optional)">
                              <input
                                className={inputCls}
                                value={p.logo}
                                placeholder="https://company.com/logo.png"
                                onChange={(e) => setField(sec.id, i, "logo", e.target.value)}
                              />
                            </Field>
                            <Field label="Text color (optional)">
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={/^#[0-9a-fA-F]{6}$/.test(p.color) ? p.color : "#3b82f6"}
                                  onChange={(e) => setField(sec.id, i, "color", e.target.value)}
                                  className="w-11 h-10 rounded-lg border border-gray-700 bg-gray-900 cursor-pointer shrink-0"
                                  aria-label="Color"
                                />
                                <input
                                  className={inputCls}
                                  value={p.color}
                                  placeholder="#3b82f6"
                                  onChange={(e) => setField(sec.id, i, "color", e.target.value)}
                                />
                              </div>
                            </Field>
                          </div>
                          <button
                            type="button"
                            onClick={() => removePartner(sec.id, i)}
                            aria-label="Delete partner"
                            className="shrink-0 w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition text-sm"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="mt-3 sm:ml-[52px] flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                          {p.name && (
                            <span
                              style={p.color ? { color: p.color } : undefined}
                              className={`font-black tracking-tighter ${
                                p.color ? "" : "text-gray-300"
                              }`}
                            >
                              {p.name}
                            </span>
                          )}
                          {p.website ? (
                            <a
                              href={p.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-brand hover:underline inline-flex items-center gap-1 min-w-0 truncate max-w-full"
                            >
                              ↗ {p.website}
                            </a>
                          ) : (
                            <span className="text-gray-600">No website link</span>
                          )}
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addPartner(sec.id)}
                      className="mt-4 text-brand hover:text-white text-sm font-semibold border border-dashed border-gray-600 hover:border-brand rounded-xl px-4 py-3 w-full transition-colors"
                    >
                      + Add Partner
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">
          Registered Partners (Portal Access)
        </h2>
        {partnerUsers.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No partner registrations yet — partners get portal access automatically
            when they register with “Partner With Us”.
          </p>
        ) : (
          <div className="space-y-3">
            {partnerUsers.map((u, i) => (
              <div
                key={`${u.email}-${i}`}
                className="flex flex-wrap items-center gap-3 bg-gray-900/60 border border-gray-800 rounded-2xl p-4 sm:p-5"
              >
                <div className="w-11 h-11 rounded-xl bg-brand/15 flex items-center justify-center font-black text-brand">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white">{u.name}</p>
                  <p className="text-sm text-gray-500 truncate">{u.email}</p>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider rounded-full px-3 py-1.5 border text-green-400 border-green-500/30 bg-green-500/10">
                  ● Portal Active
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="text-xs text-gray-600 mt-6">
        Partner logins are created automatically from registrations (read-only here).
        Partner cards are fully editable above — create, edit, delete, and preview
        them right from this page.
      </p>
    </div>
  );
}