import Reveal from "@/components/Reveal";
import type { StoryContent } from "@/lib/content-defaults";

export default function Story({ c }: { c: StoryContent }) {
  return (
    <section className="py-24 bg-black text-white relative overflow-hidden">
      <div className="absolute bottom-0 left-0 -m-20 w-96 h-96 bg-accent/15 blur-3xl rounded-full pointer-events-none" />
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-[2fr,3fr] gap-12 items-start relative z-10">
        <Reveal>
          <div>
            <span className="w-10 h-1 bg-brand rounded-full inline-block mb-6" />
            <h2 className="text-3xl md:text-5xl font-bold leading-tight">{c.heading}</h2>
          </div>
        </Reveal>
        <Reveal delay={150}>
          <p className="text-lg md:text-xl text-gray-400 leading-relaxed bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 md:p-10 shadow-2xl">
            {c.paragraph}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
