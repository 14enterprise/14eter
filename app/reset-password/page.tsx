"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "@/components/Logo";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-black text-white px-6">
          <div className="w-full max-w-sm text-center text-gray-500">Loading…</div>
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = (params.get("token") ?? "").trim();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [devUrl, setDevUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleEmail(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const json = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(json.error ?? "Something went wrong. Please try again.");
      return;
    }
    if (json.devResetUrl) setDevUrl(json.devResetUrl);
    setInfo(
      json.message ??
        "If that email is registered, a password reset link is on its way."
    );
  }

  async function handlePassword(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const json = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(json.error ?? "Reset failed. Please try again.");
      return;
    }
    router.replace((json as { redirect?: string }).redirect ?? "/login");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white relative overflow-hidden px-6">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="relative z-10 w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Link href="/">
            <Logo large />
          </Link>
        </div>

        <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-3xl p-10 shadow-2xl">
          {token ? (
            <>
              <h1 className="text-2xl font-bold text-center mb-2">Set a new password</h1>
              <p className="text-gray-400 text-sm text-center mb-8">
                Choose a new password for your 14Eter account. You&apos;ll be
                signed in right away.
              </p>
              <form onSubmit={handlePassword}>
                <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-2">
                  New password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full bg-gray-900/50 border border-gray-600 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all mb-4"
                />
                <label htmlFor="confirm" className="block text-sm font-medium text-gray-400 mb-2">
                  Confirm new password
                </label>
                <input
                  id="confirm"
                  type="password"
                  required
                  minLength={8}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full bg-gray-900/50 border border-gray-600 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all mb-4"
                />
                {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-brand/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Resetting…" : "Reset Password"}
                </button>
              </form>
              <p className="text-center text-sm text-gray-500 mt-6">
                <Link href="/login" className="text-brand hover:text-accent transition">
                  Back to sign in
                </Link>
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-center mb-2">Forgot your password?</h1>
              <p className="text-gray-400 text-sm text-center mb-8">
                Enter your account email and we&apos;ll send you a link to
                reset your password.
              </p>
              <form onSubmit={handleEmail}>
                <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full bg-gray-900/50 border border-gray-600 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all mb-4"
                />
                {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
                {info && (
                  <p className="text-green-400 text-sm mb-4 bg-green-500/10 border border-green-500/30 rounded-xl p-3">
                    {info}
                  </p>
                )}
                {devUrl && (
                  <p className="text-gray-500 text-xs mb-4 bg-gray-900/70 border border-gray-800 rounded-xl p-3 break-all">
                    DEV MODE — email not configured. Use this link:{" "}
                    <a href={devUrl} className="text-brand underline">
                      {devUrl}
                    </a>
                  </p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-brand/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending…" : "Send Reset Link"}
                </button>
              </form>
              <p className="text-center text-sm text-gray-500 mt-6">
                Remembered it?{" "}
                <Link href="/login" className="text-brand hover:text-accent transition">
                  Back to sign in
                </Link>
              </p>
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          One account works for both Partner With Us and the AI App Factory.
        </p>
      </div>
    </main>
  );
}