"use client";

import { FormEvent, useState } from "react";
import Reveal from "@/components/Reveal";
import type { ContactContent } from "@/lib/content-defaults";

const socialHover: Record<string, string> = {
  WhatsApp: "hover:bg-[#25D366] hover:shadow-[#25D366]/20",
  Instagram: "hover:bg-[#E1306C] hover:shadow-[#E1306C]/20",
  LinkedIn: "hover:bg-[#0077b5] hover:shadow-[#0077b5]/20",
  X: "hover:bg-gray-500 hover:text-black hover:shadow-gray-500/20",
  TikTok: "hover:bg-[#00f2ea] hover:text-black hover:shadow-[#00f2ea]/20",
};

export default function Contact({ c }: { c: ContactContent }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          message: data.get("message"),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Failed to send");
      setStatus("sent");
      form.reset();
      if (json.whatsappUrl) {
        window.location.href = json.whatsappUrl;
      }
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  const info = [
    { icon: "📞", label: "Call Us", value: c.phone, href: `tel:${c.phone.replace(/\s/g, "")}` },
    { icon: "✉️", label: "Email Us", value: c.email, href: `mailto:${c.email}` },
    { icon: "📍", label: "Visit Us", value: c.address },
  ];

  return (
    <section id="contact" className="py-24 bg-black text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 -m-20 w-96 h-96 bg-brand opacity-20 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 -m-20 w-96 h-96 bg-accent opacity-20 blur-3xl rounded-full pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
        <div>
          <span className="text-brand font-bold tracking-wider uppercase text-sm">
            {c.badge}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-2 mb-6">{c.heading}</h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-8">{c.paragraph}</p>
          <div className="space-y-6">
            {info.map((item) => {
              const inner = (
                <>
                  <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-2xl group-hover:bg-brand group-hover:text-white transition-colors duration-300">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">{item.label}</p>
                    <p className="font-semibold text-lg group-hover:text-brand transition">
                      {item.value}
                    </p>
                  </div>
                </>
              );
              return item.href ? (
                <a key={item.label} href={item.href} className="flex items-center gap-4 group cursor-pointer">
                  {inner}
                </a>
              ) : (
                <div key={item.label} className="flex items-center gap-4 group cursor-default">
                  {inner}
                </div>
              );
            })}
          </div>
          <div className="mt-12">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <span className="w-8 h-1 bg-brand rounded-full"></span>Connect with us
            </h3>
            <div className="flex flex-wrap gap-3">
              {(c.socials ?? []).map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`bg-gray-800 text-gray-300 px-5 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-md hover:-translate-y-1 ${
                    socialHover[s.label] ?? "hover:bg-brand"
                  }`}
                >
                  <span>{s.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 p-6 md:p-10 rounded-2xl md:rounded-3xl shadow-2xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500" />
          <h3 className="text-2xl font-bold mb-6 relative z-10">Send us a message</h3>
          <div className="space-y-5 relative z-10">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-2">
                Your Name
              </label>
              <input
                id="name"
                type="text"
                required
                name="name"
                placeholder="John Doe"
                className="w-full bg-gray-900/50 border border-gray-600 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">
                Your Email
              </label>
              <input
                id="email"
                type="email"
                required
                name="email"
                placeholder="john@example.com"
                className="w-full bg-gray-900/50 border border-gray-600 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-400 mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={4}
                placeholder="Tell us about your project..."
                className="w-full bg-gray-900/50 border border-gray-600 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={status === "sending" || status === "sent"}
              className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-brand/25 hover:shadow-brand/40 hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {status === "sending"
                ? "Sending…"
                : status === "sent"
                  ? "Message Sent ✓"
                  : "Send Message"}
            </button>
            {status === "sent" && (
              <p className="text-center text-sm text-green-400">
                Thanks for reaching out — we&#x27;ll get back to you shortly.
              </p>
            )}
            {status === "error" && (
              <p className="text-center text-sm text-red-400">{error}</p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
