"use client";

import { useState } from "react";
import Reveal from "@/components/Reveal";
import HeroImageFlow, { HERO_IMAGES } from "@/components/HeroImageFlow";
import type { HeroContent } from "@/lib/content-defaults";

export default function Hero({ c }: { c: HeroContent }) {
  const [active, setActive] = useState(0);
  const select = (i: number) => setActive(i);

  return (
    <section
      id="home"
      className="relative isolate min-h-screen flex items-center pt-28 pb-20 overflow-hidden bg-black text-white"
    >
      <HeroImageFlow active={active} onSelect={select} />

      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/65 to-black/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/55" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] h-[460px] bg-brand/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center w-full">
        <div>
          <div className="inline-block px-4 py-2 rounded-full bg-gray-900/70 backdrop-blur border border-gray-800 text-sm font-medium text-gray-300 mb-6">
            {c.badge}
          </div>
          <Reveal>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
              {c.heading}
            </h1>
          </Reveal>
          <Reveal delay={150}>
            <p className="mt-6 text-xl text-gray-300 leading-relaxed max-w-lg">
              {c.paragraph}
            </p>
          </Reveal>
          <Reveal delay={300}>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <a
                href={c.primaryCta.href}
                className="px-8 py-4 bg-brand hover:bg-brand-dark text-white font-bold rounded-xl transition shadow-lg shadow-brand/25 hover:shadow-brand/40 text-center"
              >
                {c.primaryCta.label}
              </a>
              <a
                href={c.secondaryCta.href}
                className="px-8 py-4 bg-gray-900/70 hover:bg-gray-800 backdrop-blur border border-gray-800 text-white font-bold rounded-xl transition text-center"
              >
                {c.secondaryCta.label}
              </a>
            </div>
          </Reveal>
        </div>

        <div className="justify-self-end">
          <Reveal delay={200}>
            <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-3xl p-7 shadow-2xl relative max-w-md">
              <h3 className="text-xl font-bold mb-4">{c.whyTitle}</h3>
              <ul className="space-y-3 text-gray-300">
                {(c.whyBullets ?? []).map((bullet, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-brand text-xl">✓</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {HERO_IMAGES.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Show image ${i + 1}`}
            onClick={() => select(i)}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              i === active ? "w-7 bg-brand" : "w-2 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </section>
  );
}