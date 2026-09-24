"use client";

import { useEffect, useState } from "react";
import Logo from "./Logo";
import type { Product } from "@/lib/content-defaults";

const links = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Process", href: "/#process" },
  { label: "Contact", href: "/contact" },
];

export default function Header({
  products = [],
  serverSession,
}: {
  products?: Product[];
  serverSession?: { loggedIn: true; name: string; dashboard: string } | { loggedIn: false };
}) {
  const [open, setOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [session, setSession] = useState<
    | { loading: true }
    | { loading: false; loggedIn: true; name: string; dashboard: string }
    | { loading: false; loggedIn: false }
  >(() =>
    serverSession
      ? serverSession.loggedIn
        ? { loading: false, loggedIn: true, name: serverSession.name, dashboard: serverSession.dashboard }
        : { loading: false, loggedIn: false }
      : { loading: true }
  );

  useEffect(() => {
    if (serverSession) return;
    let cancelled = false;
    fetch("/api/auth/session")
      .then((r) => (r.ok ? (r.json() as Promise<Record<string, unknown>>) : Promise.resolve({ loggedIn: false })))
      .then((j) => {
        if (cancelled) return;
        if (j.loggedIn && typeof j.name === "string" && typeof j.dashboard === "string") {
          setSession({ loading: false, loggedIn: true, name: j.name, dashboard: j.dashboard });
        } else {
          setSession({ loading: false, loggedIn: false });
        }
      })
      .catch(() => {
        if (!cancelled) setSession({ loading: false, loggedIn: false });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!productsOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setProductsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [productsOpen]);

  const dashboardHref =
  session.loading || !session.loggedIn ? null : session.dashboard;
const firstName =
  session.loading || !session.loggedIn ? null : session.name.split(" ")[0];

  return (
    <>
      <header className="fixed top-0 w-full bg-black/60 backdrop-blur-lg border-b border-white/10 z-50 animate-[fadeInDown_1s_ease-out_.8s_both]">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand/50 to-transparent opacity-50" />
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="#home" className="flex items-center gap-1 group cursor-pointer">
            <span className="group-hover:text-gray-200 transition">
              <Logo />
            </span>
          </a>
          <nav className="hidden md:flex items-center space-x-8 font-medium text-gray-300">
            {links.slice(0, 2).map((l) => (
              <a key={l.label} href={l.href} className="hover:text-brand transition">
                {l.label}
              </a>
            ))}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProductsOpen((v) => !v)}
                aria-expanded={productsOpen}
                aria-haspopup="menu"
                className="flex items-center gap-1.5 hover:text-brand transition cursor-pointer"
              >
                Our Products
                <span
                  className={`text-xs transition-transform duration-200 ${
                    productsOpen ? "rotate-180" : ""
                  }`}
                >
                  ▾
                </span>
              </button>
              {productsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProductsOpen(false)}
                  />
                  <div
                    role="menu"
                    className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-64 bg-gray-900 border border-gray-800 rounded-2xl p-2 shadow-2xl shadow-black/50 z-50"
                  >
                    {products.length ? (
                      products.map((p) => (
                        <a
                          key={p.url}
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          role="menuitem"
                          onClick={() => setProductsOpen(false)}
                          className="block px-4 py-2.5 rounded-xl text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition"
                        >
                          {p.name}
                        </a>
                      ))
                    ) : (
                      <p className="px-4 py-2.5 text-sm text-gray-500">
                        No products yet
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
            {links.slice(2).map((l) => (
              <a key={l.label} href={l.href} className="hover:text-brand transition">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="hidden md:flex items-center space-x-4">
            {session.loading ? (
              <span className="text-sm text-gray-500 animate-pulse">…</span>
            ) : session.loggedIn && dashboardHref ? (
              <a
                href={dashboardHref}
                className="bg-white text-black px-5 py-2 rounded-full font-bold hover:bg-brand hover:text-white transition"
              >
                {firstName ? `${firstName}'s ` : ""}Dashboard
              </a>
            ) : (
              <>
                <a href="/login" className="text-gray-300 hover:text-white transition">
                  Login
                </a>
                <a
                  href="/register"
                  className="bg-white text-black px-4 py-2 rounded-full font-bold hover:bg-brand hover:text-white transition"
                >
                  Register
                </a>
              </>
            )}
          </div>
          <button
            className="md:hidden text-2xl text-white"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            ☰
          </button>
        </div>
      </header>

      <div
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
      >
        <div
          className={`w-72 max-w-[85vw] bg-gray-900 h-full p-6 border-r border-gray-800 transform transition-transform duration-300 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-8">
            <span className="text-xl font-bold text-white">Menu</span>
            <button
              className="text-xl text-gray-400 hover:text-white"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>
          </div>
          <nav className="flex flex-col space-y-6 text-lg font-medium text-gray-300">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="hover:text-brand"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </a>
            ))}
            <div>
              <button
                type="button"
                onClick={() => setProductsOpen((v) => !v)}
                aria-expanded={productsOpen}
                className="flex items-center gap-1.5 hover:text-brand cursor-pointer"
              >
                Our Products
                <span
                  className={`text-xs transition-transform duration-200 ${
                    productsOpen ? "rotate-180" : ""
                  }`}
                >
                  ▾
                </span>
              </button>
              {productsOpen && (
                <div className="mt-3 space-y-1 border-l border-gray-800 pl-4">
                  {products.length ? (
                    products.map((p) => (
                      <a
                        key={p.url}
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setOpen(false)}
                        className="block py-1.5 text-sm text-gray-400 hover:text-brand transition"
                      >
                        {p.name}
                      </a>
                    ))
                  ) : (
                    <p className="py-1.5 text-sm text-gray-600">No products yet</p>
                  )}
                </div>
              )}
            </div>
            <hr className="border-gray-800 my-2" />
            {session.loading ? (
              <p className="text-sm text-gray-500 animate-pulse">Checking session…</p>
            ) : session.loggedIn && dashboardHref ? (
              <a
                href={dashboardHref}
                className="inline-block bg-white text-black px-5 py-2.5 rounded-full font-bold"
                onClick={() => setOpen(false)}
              >
                {firstName ? `${firstName}'s ` : ""}Dashboard →
              </a>
            ) : (
              <>
                <a href="/login" className="hover:text-brand" onClick={() => setOpen(false)}>
                  Login
                </a>
                <a href="/register" className="hover:text-brand" onClick={() => setOpen(false)}>
                  Register
                </a>
              </>
            )}
          </nav>
        </div>
      </div>
    </>
  );
}