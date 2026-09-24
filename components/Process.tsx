import Reveal from "@/components/Reveal";
import type { ProcessContent } from "@/lib/content-defaults";

export default function Process({ c }: { c: ProcessContent }) {
  return (
    <section id="process" className="py-24 bg-black text-white relative overflow-hidden">
      <div className="absolute bottom-0 right-0 -m-20 w-96 h-96 bg-accent/20 blur-3xl rounded-full pointer-events-none" />
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <Reveal>
          <div className="text-center mb-14">
            <span className="bg-accent/20 text-accent text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-accent/20">
              {c.badge}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mt-4 leading-tight">
              {c.heading}
            </h2>
          </div>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-8">
          {(c.steps ?? []).map((step, i) => (
            <Reveal key={i} delay={i * 150}>
              <div className="h-full text-center bg-gray-900/60 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-gray-800 hover:-translate-y-1 transition-transform duration-300">
                <div className="inline-flex w-14 h-14 rounded-full bg-gradient-to-br from-brand to-accent items-center justify-center text-xl font-black text-white mb-6 shadow-lg shadow-brand/30">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
