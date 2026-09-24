import Reveal from "@/components/Reveal";
import type { PageHeroContent } from "@/lib/content-defaults";

export default function PageHero({ c }: { c: PageHeroContent }) {
  return (
    <section className="relative pt-40 pb-16 overflow-hidden bg-black text-white text-center">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-brand/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="max-w-3xl mx-auto px-6 relative z-10">
        <Reveal>
          <span className="inline-block px-4 py-2 rounded-full bg-gray-900 border border-gray-800 text-sm font-medium text-gray-300 mb-6">
            {c.badge}
          </span>
        </Reveal>
        <Reveal delay={120}>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
            {c.heading}
          </h1>
        </Reveal>
        <Reveal delay={240}>
          <p className="mt-6 text-lg md:text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto">
            {c.paragraph}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
