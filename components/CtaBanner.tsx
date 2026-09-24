import Reveal from "@/components/Reveal";
import type { CtaBannerContent } from "@/lib/content-defaults";

export default function CtaBanner({ c }: { c: CtaBannerContent }) {
  return (
    <section className="py-24 bg-black text-white relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand/20 blur-[130px] rounded-full pointer-events-none" />
      <Reveal>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 rounded-3xl p-12 md:p-16 shadow-2xl">
            <h2 className="text-3xl md:text-5xl font-bold leading-tight">{c.heading}</h2>
            <a
              href={c.buttonHref}
              className="inline-block mt-10 px-10 py-4 bg-brand hover:bg-brand-dark text-white font-bold rounded-xl transition shadow-lg shadow-brand/25 hover:shadow-brand/40"
            >
              {c.buttonLabel} →
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
