import Reveal from "@/components/Reveal";
import type { ValuesContent } from "@/lib/content-defaults";

export default function Values({ c }: { c: ValuesContent }) {
  return (
    <section className="py-24 bg-black text-white relative overflow-hidden">
      <div className="absolute top-1/3 right-0 -m-20 w-96 h-96 bg-brand/15 blur-3xl rounded-full pointer-events-none" />
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <Reveal>
          <div className="text-center mb-14">
            <span className="bg-accent/20 text-accent text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-accent/20">
              {c.badge}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mt-4 leading-tight">{c.heading}</h2>
          </div>
        </Reveal>
        <div className="grid sm:grid-cols-2 gap-8">
          {(c.values ?? []).map((v, i) => (
            <Reveal key={i} delay={i * 120}>
              <div className="h-full bg-gray-900/60 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-gray-800 hover:border-brand/40 hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 bg-brand/20 rounded-2xl flex items-center justify-center text-2xl mb-6">
                  {v.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{v.title}</h3>
                <p className="text-gray-400 leading-relaxed">{v.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
