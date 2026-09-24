"use client";

import { useState } from "react";
import type { ClientRow } from "./types";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "pending", label: "Under Review" },
  { value: "approved", label: "Approved" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

export default function ClientsView({
  clients,
  onChanged,
}: {
  clients: ClientRow[];
  onChanged: () => void;
}) {
  const [savingId, setSavingId] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // "Partner With Us" users have their own View Partners tab — show DIY only.
  const diyClients = clients.filter((c) => c.model !== "partner");
  const approved = diyClients.filter((c) => c.status === "approved").length;
  const pending = diyClients.filter((c) => c.status === "pending").length;
  const inProgress = diyClients.filter((c) => c.status === "in_progress").length;

  async function setStatus(id: number, status: string) {
    setSavingId(id);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/user-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error ?? "Failed to update status.");
      } else {
        setMessage(`Updated project to “${statusLabels()[status]}”.`);
        onChanged();
      }
    } finally {
      setSavingId(null);
    }
  }

  function statusLabels() {
    return Object.fromEntries(STATUS_OPTIONS.map((s) => [s.value, s.label]));
  }

  async function callAction(
    endpoint: string,
    id: number,
    idLabel: string,
    confirmText: string
  ) {
    if (!window.confirm(confirmText)) return;
    setBusyId(id);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Action failed.");
      } else {
        setMessage(`${idLabel} deleted.`);
        onChanged();
      }
    } finally {
      setBusyId(null);
    }
  }

  const statusBadge = (status: string) => {
    const good = ["approved", "completed"];
    const warn = status === "pending";
    return (
      <span
        className={`text-xs font-bold uppercase tracking-wider rounded-full px-3 py-1.5 border w-fit ${
          good.includes(status)
            ? "text-green-400 border-green-500/30 bg-green-500/10"
            : warn
              ? "text-amber-400 border-amber-500/30 bg-amber-500/10"
              : "text-brand border-brand/30 bg-brand/10"
        }`}
      >
        {statusLabels()[status] ?? status}
      </span>
    );
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 sm:p-5">
          <p className="text-2xl sm:text-3xl font-black text-white">{diyClients.length}</p>
          <p className="text-[10px] sm:text-xs uppercase tracking-widest text-gray-500 mt-1">
            Registered Projects
          </p>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 sm:p-5">
          <p className="text-2xl sm:text-3xl font-black text-green-400">{approved}</p>
          <p className="text-[10px] sm:text-xs uppercase tracking-widest text-gray-500 mt-1">
            Approved
          </p>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 sm:p-5">
          <p className="text-2xl sm:text-3xl font-black text-amber-400">{pending}</p>
          <p className="text-[10px] sm:text-xs uppercase tracking-widest text-gray-500 mt-1">
            Under Review
          </p>
        </div>
      </div>

      {message && (
        <p className="mb-6 text-sm text-gray-300 bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-3">
          {message}
        </p>
      )}
      {error && (
        <p className="mb-6 text-sm text-red-400 bg-red-950/40 border border-red-800 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {diyClients.length === 0 ? (
        <p className="text-gray-500 text-sm">
          No registrations yet — projects are approved automatically the moment a
          user registers.
        </p>
      ) : (
        <div className="space-y-4">
          {diyClients.map((c) => (
            <div
              key={c.id}
              className="flex flex-col md:flex-row md:items-center gap-4 bg-gray-900/60 border border-gray-800 rounded-2xl p-5 hover:border-brand/30 transition-colors"
            >
              <div className="w-11 h-11 rounded-xl bg-brand/15 flex items-center justify-center font-black text-brand shrink-0">
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white flex items-center gap-2 flex-wrap">
                  {c.name}
                  <span
                    className={`text-[10px] uppercase tracking-widest rounded-full px-2 py-0.5 border ${
                      c.model === "partner"
                        ? "text-brand border-brand/30 bg-brand/10"
                        : "text-accent border-accent/30 bg-accent/10"
                    }`}
                  >
                    {c.model === "partner" ? "Partner With Us" : "AI App Factory"}
                  </span>
                </p>
                <p className="text-sm text-gray-500 truncate">{c.email}</p>
                <p className="text-sm text-gray-400 mt-1">
                  <span className="font-semibold text-white">{c.projectName}</span>{" "}
                  · {c.projectType}
                  {c.company ? ` · ${c.company}` : ""}
                  {c.appSlug ? (
                    <span className="ml-1 text-accent">
                      ·{" "}
                      <a
                        href={`https://${c.appSlug}.14eter.org`}
                        target="_blank"
                        rel="noreferrer"
                        className="underline decoration-accent/40 underline-offset-2 hover:text-white"
                      >
                        {c.appSlug}.14eter.org
                      </a>
                    </span>
                  ) : null}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {statusBadge(c.status)}
                <select
                  aria-label={`Status for ${c.name}`}
                  value={c.status}
                  disabled={savingId === c.id}
                  onChange={(e) => void setStatus(c.id, e.target.value)}
                  className="bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand disabled:opacity-50"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                {c.status !== "approved" && (
                  <button
                    onClick={() => void setStatus(c.id, "approved")}
                    disabled={savingId === c.id}
                    className="text-sm font-bold bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl px-4 py-2 hover:bg-green-500/20 transition disabled:opacity-50"
                  >
                    Approve
                  </button>
                )}
                {c.appSlug ? (
                  <button
                    onClick={() =>
                      void callAction(
                        "/api/admin/delete-app",
                        c.id,
                        "App",
                        `Delete the live app ${c.appSlug}.14eter.org for ${c.name}? The account and blueprint stay — they can rebuild anytime.`
                      )
                    }
                    disabled={busyId === c.id}
                    className="text-sm font-bold bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded-xl px-4 py-2 hover:bg-orange-500/20 transition disabled:opacity-50"
                  >
                    Delete App
                  </button>
                ) : null}
                <button
                  onClick={() =>
                    void callAction(
                      "/api/admin/delete-user",
                      c.id,
                      "User",
                      `Delete ${c.name} (${c.email}) entirely, including ${
                        c.appSlug ? `their live app ${c.appSlug}.14eter.org, ` : ""
                      }account and dashboard access? This cannot be undone.`
                    )
                  }
                  disabled={busyId === c.id}
                  className="text-sm font-bold bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-2 hover:bg-red-500/20 transition disabled:opacity-50"
                >
                  {busyId === c.id ? "Deleting…" : "Delete User"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-600 mt-6">
        Projects are approved automatically at registration, and both the client and
        admin receive an email. Use this page to change a project’s status anytime —
        it updates the client’s dashboard instantly.
      </p>
    </div>
  );
}