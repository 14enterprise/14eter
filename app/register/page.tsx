"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";

const projectTypes = [
  "Website",
  "Web Application",
  "Mobile Application",
  "E-commerce / Store",
  "SaaS / Platform",
  "Other",
];

const websiteModels = [
  { value: "partner", label: "Partner With Us" },
  { value: "diy", label: "AI App Factory" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    company: "",
    websiteModel: "",
    projectName: "",
    projectType: "",
    projectDescription: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(key: keyof typeof form) {
    return (e: { target: { value: string } }) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(json.error ?? "Registration failed. Please try again.");
      return;
    }
    router.replace((json as { redirect?: string }).redirect ?? "/user-dashboard");
  }

  const inputClass =
    "w-full bg-gray-900/50 border border-gray-600 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all";

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden px-6 py-24">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="flex justify-center mb-6">
          <Link href="/">
            <Logo large />
          </Link>
        </div>

        <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 md:p-10 shadow-2xl">
          <h1 className="text-2xl md:text-3xl font-bold text-center mb-2">
            Register your project
          </h1>
          <p className="text-gray-400 text-sm text-center mb-8">
            Sign up and tell us what you want to build. Your dashboard is ready
            as soon as you register.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-2">
                  Full name *
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  autoFocus
                  value={form.name}
                  onChange={update("name")}
                  placeholder="Ada Obi"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">
                  Email address *
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={update("email")}
                  placeholder="you@company.com"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-2">
                  Password *
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={update("password")}
                  placeholder="Minimum 8 characters"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-400 mb-2">
                  Company / organization
                </label>
                <input
                  id="company"
                  type="text"
                  value={form.company}
                  onChange={update("company")}
                  placeholder="Optional"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="websiteModel" className="block text-sm font-medium text-gray-400 mb-2">
                Website Model *
              </label>
              <select
                id="websiteModel"
                required
                value={form.websiteModel}
                onChange={update("websiteModel")}
                className={`${inputClass} appearance-none ${form.websiteModel ? "" : "text-gray-500"}`}
              >
                <option value="" disabled className="text-gray-400">
                  Select your model…
                </option>
                {websiteModels.map((m) => (
                  <option key={m.value} value={m.value} className="text-white bg-gray-900">
                    {m.label}
                  </option>
                ))}
              </select>
              <p className="text-gray-500 text-xs mt-2">
                Partner With Us — we build, host, and support your product. AI
                App Factory — pick a template for your category, customize it
                yourself, and publish your own live site on a 14eter.org
                subdomain in minutes.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="projectName" className="block text-sm font-medium text-gray-400 mb-2">
                  Project name *
                </label>
                <input
                  id="projectName"
                  type="text"
                  required
                  value={form.projectName}
                  onChange={update("projectName")}
                  placeholder="e.g. Delivery app"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="projectType" className="block text-sm font-medium text-gray-400 mb-2">
                  What are you building? *
                </label>
                <select
                  id="projectType"
                  required
                  value={form.projectType}
                  onChange={update("projectType")}
                  className={`${inputClass} appearance-none ${form.projectType ? "" : "text-gray-500"}`}
                >
                  <option value="" disabled className="text-gray-400">
                    Select a type…
                  </option>
                  {projectTypes.map((t) => (
                    <option key={t} value={t} className="text-white bg-gray-900">
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-400 mb-2">
                Tell us about your project *
              </label>
              <textarea
                id="projectDescription"
                required
                rows={5}
                value={form.projectDescription}
                onChange={update("projectDescription")}
                placeholder="What does your project do? Who is it for? Any features you have in mind?"
                className={`${inputClass} resize-none`}
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-brand/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating your account…" : "Register & Continue"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500 space-y-1">
            <p>
              Already registered?{" "}
              <Link href="/login" className="text-brand hover:text-accent transition">
                Login
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          By registering you agree that 14Eter Limited may contact you about
          your project enquiry.
        </p>
      </div>
    </main>
  );
}