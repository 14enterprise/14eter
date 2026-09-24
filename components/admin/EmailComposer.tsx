"use client";

import { FormEvent, useState } from "react";
import type { ClientRow } from "./types";

type Result = { sent: number; failed: number; errors: string[] } | null;
type Mode = "all" | "partners" | "clients" | "single" | "list";

const MODE_LABELS: Record<Exclude<Mode, "single" | "list">, string> = {
  all: "All Users",
  partners: "Partners",
  clients: "App Factory",
};

const EMAIL_RE = /^\S+@\S+\.\S+$/;

export default function EmailComposer({ clients }: { clients: ClientRow[] }) {
  const [mode, setMode] = useState<Mode>("all");
  const [to, setTo] = useState("");
  const [list, setList] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<Result>(null);
  const [error, setError] = useState("");

  const uniq = (list: string[]) => [...new Set(list)];

  const allEmails = uniq(
    clients.map((c) => c.email?.trim().toLowerCase()).filter((e): e is string => !!e)
  );
  const partnerEmails = uniq(
    clients
      .filter((c) => c.model === "partner")
      .map((c) => c.email?.trim().toLowerCase())
      .filter((e): e is string => !!e)
  );
  const clientEmails = uniq(
    clients
      .filter((c) => c.model === "diy")
      .map((c) => c.email?.trim().toLowerCase())
      .filter((e): e is string => !!e)
  );

  const listEmails = uniq(
    list
      .split(/[\n,;]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => EMAIL_RE.test(e))
  );

  const targetEmails =
    mode === "partners" ? partnerEmails : mode === "clients" ? clientEmails : allEmails;

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    setSending(true);
    setError("");
    setResult(null);
    const res = await fetch("/api/admin/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        audience:
          mode === "all" || mode === "partners" || mode === "clients" ? mode : undefined,
        to: mode === "single" ? to : undefined,
        emails: mode === "list" ? listEmails : undefined,
        subject,
        message,
      }),
    });
    const json = await res.json().catch(() => ({}));
    setSending(false);
    if (!res.ok) {
      setError(json.error ?? "Failed to send");
      return;
    }
    setResult({ sent: json.sent, failed: json.failed, errors: json.errors ?? [] });
    if (json.sent > 0) {
      setSubject("");
      setMessage("");
    }
  }

  return (
    <form onSubmit={handleSend} className="max-w-2xl">
      <div className="flex flex-wrap gap-2 mb-6 p-1 bg-gray-900 border border-gray-800 rounded-xl w-fit">
        {(Object.keys(MODE_LABELS) as (keyof typeof MODE_LABELS)[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setMode(key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              mode === key ? "bg-brand text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            {MODE_LABELS[key]}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setMode("single")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            mode === "single" ? "bg-brand text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          Single Address
        </button>
        <button
          type="button"
          onClick={() => setMode("list")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            mode === "list" ? "bg-brand text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          Email List
        </button>
      </div>

      {mode === "list" ? (
        <div className="mb-5">
          <label htmlFor="email-list" className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
            Emails
          </label>
          <textarea
            id="email-list"
            rows={5}
            value={list}
            onChange={(e) => setList(e.target.value)}
            placeholder={"Anyone — registered or not.\none@example.com\ntwo@example.com, three@example.com"}
            className="w-full bg-gray-900/60 border border-gray-700 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-all resize-none font-mono text-sm"
          />
          <p className="text-gray-600 text-sm mt-2">
            {listEmails.length > 0 ? (
              <>
                Will send to <span className="font-bold text-brand">{listEmails.length}</span>{" "}
                valid address{listEmails.length === 1 ? "" : "es"} — invalid ones are skipped.
              </>
            ) : (
              "Separate multiple emails with commas, semicolons or new lines."
            )}
          </p>
        </div>
      ) : mode !== "single" ? (
        <div className="mb-5 bg-gray-900/60 border border-gray-800 rounded-xl p-4 text-sm">
          <p className="text-gray-300">
            Sending to{" "}
            <span className="font-bold text-brand">{targetEmails.length}</span>{" "}
            {MODE_LABELS[mode].toLowerCase()} with an email.
          </p>
          {targetEmails.length > 0 && (
            <p className="text-gray-600 mt-1 truncate">{targetEmails.join(", ")}</p>
          )}
        </div>
      ) : (
        <div className="mb-5">
          <label htmlFor="email-to" className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
            To
          </label>
          <input
            id="email-to"
            type="email"
            required={mode === "single"}
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="recipient@example.com"
            className="w-full bg-gray-900/60 border border-gray-700 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-all"
          />
        </div>
      )}

      <div className="mb-5">
        <label htmlFor="email-subject" className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
          Subject
        </label>
        <input
          id="email-subject"
          type="text"
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. Milestone update — March build"
          className="w-full bg-gray-900/60 border border-gray-700 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-all"
        />
      </div>

      <div className="mb-6">
        <label htmlFor="email-body" className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
          Message
        </label>
        <textarea
          id="email-body"
          required
          rows={8}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your update… blank lines start new paragraphs."
          className="w-full bg-gray-900/60 border border-gray-700 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-all resize-none"
        />
      </div>

      {error && (
        <p className="text-red-400 text-sm mb-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          {error}
        </p>
      )}
      {result && (
        <div className="mb-4 bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-3 text-sm">
          <p className="text-green-400 font-semibold">
            Sent to {result.sent} recipient{result.sent === 1 ? "" : "s"} ✓
          </p>
          {result.failed > 0 && (
            <ul className="mt-2 space-y-1 text-red-400 text-xs list-disc list-inside">
              {result.errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={
          sending ||
          (mode === "single"
            ? false
            : mode === "list"
              ? listEmails.length === 0
              : targetEmails.length === 0)
        }
        className="px-8 py-3.5 rounded-xl font-bold text-sm bg-brand hover:bg-brand-dark shadow-lg shadow-brand/25 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {sending
          ? "Sending…"
          : mode === "list"
            ? "Send Email to List"
            : mode === "single"
              ? "Send Email"
              : `Send Email to ${MODE_LABELS[mode]}`}
      </button>
    </form>
  );
}