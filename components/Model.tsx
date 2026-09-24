import Reveal from "@/components/Reveal";
import type { ModelContent } from "@/lib/content-defaults";

export default function Model({ c }: { c: ModelContent }) {
  return (
    <section id="model" className="py-24 bg-black text-white relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-brand/20 blur-[120px] rounded-full pointer-events-none" />
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
        <div className="grid md:grid-cols-2 gap-8">
          {(c.cards ?? []).map((card, i) => (
            <Reveal key={i} delay={i * 150}>
              <div className="h-full bg-gray-900/60 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-gray-800 hover:border-brand/40 transition-colors duration-300">
                <div className="w-14 h-14 bg-brand/20 rounded-2xl flex items-center justify-center text-2xl mb-6">
                  {card.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{card.title}</h3>
                <p className="text-gray-400 leading-relaxed">{card.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
