"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(json.error ?? "Login failed");
      return;
    }
    router.replace((json as { redirect?: string }).redirect ?? "/dashboard");
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
          <h1 className="text-2xl font-bold text-center mb-2">Welcome back</h1>
          <p className="text-gray-400 text-sm text-center mb-8">
            Sign in with the details you used when registering — we&apos;ll send you
            to the right portal.
          </p>
          <form onSubmit={handleSubmit}>
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
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-400"
              >
                Password
              </label>
              <Link
                href="/reset-password"
                className="text-xs text-brand hover:text-accent transition"
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-gray-900/50 border border-gray-600 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all mb-4"
            />
            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-brand/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            New to 14Eter?{" "}
            <Link href="/register" className="text-brand hover:text-accent transition">
              Register your project
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          One account works for both Partner With Us and the AI App Factory.
        </p>
      </div>
    </main>
  );
}