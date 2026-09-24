"use client";

import { useEffect, useRef, useState } from "react";
import Reveal from "@/components/Reveal";
import type { PartnersContent } from "@/lib/content-defaults";

const STEP = 248; // one card: w-56 (224) + gap (24)
const SPEED = 46; // px per second

export default function Partners({ c }: { c: PartnersContent }) {
  const partners = c.partners ?? [];
  const doubled = [...partners, ...partners];
  const scrollerRef = useRef<HTMLDivElement>(null);
  const spanRef = useRef(0);
  const pausedRef = useRef(false);
  const draggingRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const dragStartRef = useRef<{ x: number; left: number } | null>(null);
  const openRef = useRef(false);
  const [open, setOpen] = useState<{ name: string; website: string } | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const apply = () => setMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const mask = mobile
    ? "linear-gradient(to right, transparent, black 3%, black 97%, transparent)"
    : "linear-gradient(to right, transparent, black 8%, black 92%, transparent)";

  useEffect(() => {
    const el = scrollerRef.current;
    if (el) spanRef.current = Math.round(el.scrollWidth / 2);

    const tick = (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = Math.min(0.05, (ts - lastTsRef.current) / 1000);
      lastTsRef.current = ts;
      const scroller = scrollerRef.current;
      if (scroller) {
        if (!pausedRef.current && !draggingRef.current) {
          const half = spanRef.current;
          if (half > 0) {
            scroller.scrollLeft = (scroller.scrollLeft + SPEED * dt) % half;
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    const onResize = () => {
      const s = scrollerRef.current;
      if (s) spanRef.current = Math.round(s.scrollWidth / 2);
    };
    window.addEventListener("resize", onResize);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    pausedRef.current = open !== null;
    openRef.current = open !== null;
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  function nudge(dir: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    let half = spanRef.current;
    if (half <= 0) half = Math.round(el.scrollWidth / 2);
    if (half <= 0) return;
    let target = Math.round(el.scrollLeft + dir * STEP);
    while (target < 0) target += half;
    while (target >= half) target -= half;
    el.scrollTo({ left: target, behavior: "smooth" });
  }

  function endDrag() {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    dragStartRef.current = null;
    window.removeEventListener("pointermove", moveDrag);
    window.removeEventListener("pointerup", endDrag);
    window.removeEventListener("pointercancel", endDrag);
    if (!openRef.current) pausedRef.current = false;
  }

  function moveDrag(e: PointerEvent) {
    const el = scrollerRef.current;
    const start = dragStartRef.current;
    if (!draggingRef.current || !el || !start) return;
    const half = spanRef.current;
    let next = start.left - (e.clientX - start.x);
    if (half > 0) {
      while (next < 0) next += half;
      while (next >= half) next -= half;
    }
    el.scrollLeft = next;
    e.preventDefault();
  }

  function startDrag(e: React.PointerEvent<HTMLDivElement>) {
    draggingRef.current = true;
    pausedRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      left: scrollerRef.current?.scrollLeft ?? 0,
    };
    window.addEventListener("pointermove", moveDrag);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
  }

  function openSite(name: string, website: string) {
    setLoaded(false);
    setOpen({ name, website });
  }

  return (
    <section id="partners" className="py-24 bg-black text-white relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-brand/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <Reveal>
          <div className="text-center mb-14">
            <span className="bg-brand/20 text-brand text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-brand/20">
              {c.badge}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mt-4 leading-tight">
              {c.heading}
            </h2>
            <p className="text-gray-400 mt-4 text-lg max-w-2xl mx-auto">{c.paragraph}</p>
          </div>
        </Reveal>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div
          ref={scrollerRef}
          className="overflow-hidden cursor-grab active:cursor-grabbing select-none"
          style={{
            maskImage: mask,
            WebkitMaskImage: mask,
            touchAction: "pan-y",
          }}
          onMouseEnter={() => {
            pausedRef.current = true;
          }}
          onMouseLeave={() => {
            if (!openRef.current) pausedRef.current = false;
          }}
          onPointerDown={startDrag}
        >
          <div className="flex gap-6 w-max pr-6" style={{ willChange: "scroll-position" }}>
            {doubled.map((p, i) => {
              const base =
                "w-[calc(100vw-3rem)] sm:w-56 shrink-0 bg-gray-900/60 backdrop-blur-xl rounded-2xl p-8 border border-gray-800 hover:border-brand/40 transition-colors duration-300 flex flex-col items-center justify-center gap-1 group";
              const inner = (
                <>
                  {p.logo ? (
                    <img
                      src={p.logo}
                      alt={`${p.name} logo`}
                      loading="lazy"
                      className="h-12 w-auto max-w-[85%] object-contain grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-300"
                    />
                  ) : (
                    <span
                      style={p.color ? { color: p.color } : undefined}
                      className={`text-2xl font-black tracking-tighter truncate max-w-full transition-colors duration-300 ${
                        p.color ? "" : "text-gray-500 group-hover:text-white"
                      }`}
                    >
                      {p.name}
                    </span>
                  )}
                  <span className="text-xs uppercase tracking-widest text-gray-600 group-hover:text-gray-400 transition-colors duration-300">
                    {p.tag}
                  </span>
                </>
              );
              return p.website ? (
                <button
                  key={`${p.name}-${i}`}
                  type="button"
                  onClick={() => openSite(p.name, p.website ?? "")}
                  aria-label={`Preview ${p.name} website`}
                  title={`Preview ${p.name} website`}
                  className={`${base} cursor-pointer`}
                >
                  {inner}
                </button>
              ) : (
                <div key={`${p.name}-${i}`} className={`${base} cursor-default`}>
                  {inner}
                </div>
              );
            })}
          </div>
        </div>

        {partners.length > 0 && (
          <div className="flex items-center justify-center gap-6 mt-10">
            <button
              type="button"
              onClick={() => nudge(-1)}
              aria-label="Slide left"
              className="w-12 h-12 rounded-full border border-gray-700 hover:border-brand bg-gray-900/60 text-gray-300 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110"
            >
              ←
            </button>
            <p className="text-xs text-gray-600">
              Drag to slide · hover to pause
            </p>
            <button
              type="button"
              onClick={() => nudge(1)}
              aria-label="Slide right"
              className="w-12 h-12 rounded-full border border-gray-700 hover:border-brand bg-gray-900/60 text-gray-300 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110"
            >
              →
            </button>
          </div>
        )}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
          onClick={() => setOpen(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`${open.name} website preview`}
        >
          <div
            className="w-full max-w-6xl h-full max-h-[94vh] bg-white rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 sm:gap-3 px-3 py-2.5 sm:px-5 sm:py-3.5 bg-black text-white border-b border-gray-800 shrink-0">
              <p className="font-bold truncate min-w-0">
                {open.name}
                <span className="text-gray-500 font-normal text-sm hidden sm:inline">
                  {" "}
                  · website preview
                </span>
              </p>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={open.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open ${open.name} in a new tab`}
                  className="flex items-center justify-center h-10 w-10 sm:h-auto sm:w-auto text-sm sm:text-xs font-semibold text-brand hover:text-brand-dark border border-gray-700 rounded-full sm:px-3 sm:py-1.5 transition"
                >
                  <span className="sm:hidden" aria-hidden="true">↗</span>
                  <span className="hidden sm:inline">Open in new tab ↗</span>
                </a>
                <button
                  type="button"
                  onClick={() => setOpen(null)}
                  aria-label="Close preview"
                  className="w-10 h-10 sm:w-9 sm:h-9 rounded-lg bg-gray-800 hover:bg-gray-700 transition text-gray-300"
                >
                  ✕
                </button>
              </div>
            </div>
            {!loaded && (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-white text-gray-800">
                <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-500">Loading {open.name}…</p>
              </div>
            )}
            <iframe
              key={open.website}
              src={open.website}
              title={`${open.name} website`}
              className={`w-full bg-white ${loaded ? "block flex-1" : "hidden"}`}
              onLoad={() => setLoaded(true)}
            />
          </div>
        </div>
      )}
    </section>
  );
}