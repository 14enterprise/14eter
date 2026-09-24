"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.replace("/admin");
    } else {
      setError("Incorrect password");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white relative overflow-hidden px-6">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand/20 blur-[120px] rounded-full pointer-events-none" />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-sm bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-3xl p-10 shadow-2xl"
      >
        <h1 className="text-2xl font-bold text-center mb-2">Admin Access</h1>
        <p className="text-gray-400 text-sm text-center mb-8">
          Enter your password to manage site content.
        </p>
        <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-2">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-gray-900/50 border border-gray-600 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all mb-4"
          placeholder="••••••••"
        />
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-brand/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Checking..." : "Sign In"}
        </button>
      </form>
    </main>
  );
}
