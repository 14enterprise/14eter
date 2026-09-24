"use client";

import { useState } from "react";

export function SiteAdminLogin({ slug }: { slug: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Could not sign you in.");
        return;
      }
      window.location.reload();
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-brand mb-1">
            Site admin
          </p>
          <h1 className="text-2xl font-bold">{slug}.14eter.org</h1>
          <p className="text-sm text-gray-500 mt-1">
            Sign in with the account that owns this site.
          </p>
        </div>
        <form
          onSubmit={submit}
          className="bg-black/40 border border-gray-800 rounded-2xl p-6 space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/40 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand transition-all text-sm"
              placeholder="you@email.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand transition-all text-sm"
              placeholder="Your password"
            />
          </div>
          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full font-bold text-sm bg-brand hover:bg-brand-dark text-white rounded-xl px-4 py-3.5 transition disabled:opacity-50"
          >
            {busy ? "Signing in…" : "Manage my site"}
          </button>
        </form>
        <p className="text-center text-xs text-gray-600 mt-5">
          <a href="./" className="hover:text-brand">
            ← Back to the live site
          </a>
        </p>
      </div>
    </main>
  );
}

export function LogoutButton() {
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    try {
      await fetch("/api/user/session", { method: "DELETE" });
    } finally {
      setBusy(false);
      const path = window.location.pathname;
      const slug = path.split("/")[2] ?? "";
      window.location.href = `/app/${slug}/admin`;
    }
  }

  return (
    <button
      onClick={() => void logout()}
      disabled={busy}
      className="text-xs font-semibold text-gray-400 hover:text-white transition disabled:opacity-50"
    >
      {busy ? "…" : "Log out"}
    </button>
  );
}