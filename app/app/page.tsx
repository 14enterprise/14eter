import Link from "next/link";

export const metadata = {
  title: "Create a Website in Minutes | 14Eter",
  description:
    "Pick a template, add your content, get your own website at yourbrand.14eter.org. No code needed.",
};

const STEPS = [
  {
    n: "01",
    title: "Pick a template",
    text: "Choose a category — restaurant, business, portfolio, fitness and more — and preview templates until one feels right.",
  },
  {
    n: "02",
    title: "Add your content",
    text: "Fill in your brand, menu or services, contact details and photos straight from your browser. No code, no designer.",
  },
  {
    n: "03",
    title: "Publish & own it",
    text: "Hit publish and get your own site live instantly at yourbrand.14eter.org, with an admin panel to manage everything.",
  },
];

export default function AppLandingPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <p className="font-bold tracking-tight">
          14Eter<span className="text-brand">.</span>
        </p>
        <Link
          href="/"
          className="text-sm text-gray-400 hover:text-white transition"
        >
          ← Back to 14Eter.org
        </Link>
      </nav>

      <section className="max-w-6xl mx-auto px-6 pt-16 pb-24 text-center">
        <span className="inline-block px-4 py-1.5 rounded-full border border-brand/40 text-brand text-xs font-bold uppercase tracking-widest mb-6">
          Website in a few clicks
        </span>
        <h1 className="max-w-3xl mx-auto text-5xl md:text-7xl font-extrabold leading-[1.05] tracking-tight">
          Own a website in just{" "}
          <span className="bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent">
            a few clicks
          </span>
        </h1>
        <p className="max-w-xl mx-auto mt-6 text-lg text-gray-400">
          No code. No waiting. Pick a template, drop in your content, and get
          your own site live at{" "}
          <span className="text-white font-semibold">yourbrand.14eter.org</span>
          — with an admin panel to manage it all.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="px-8 py-4 rounded-xl font-bold bg-brand hover:bg-brand-dark transition shadow-lg shadow-brand/25"
          >
            Create my site →
          </Link>
          <a
            href="#how"
            className="px-8 py-4 rounded-xl font-semibold bg-gray-900 border border-gray-800 hover:border-brand hover:text-brand transition"
          >
            How it works
          </a>
        </div>
        <p className="mt-5 text-xs text-gray-500">
          Takes ~2 minutes · Free to start · Your own subdomain included
        </p>
      </section>

      <section id="how" className="bg-gray-950 border-y border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-12 text-center">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="bg-black/40 border border-gray-800 rounded-3xl p-8"
              >
                <p className="text-brand font-extrabold text-sm mb-4">{s.n}</p>
                <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                <p className="text-gray-400 leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="max-w-2xl mx-auto text-3xl md:text-4xl font-bold tracking-tight">
          From zero to live website — in one sitting
        </h2>
        <p className="max-w-lg mx-auto mt-4 text-gray-400">
          Build a professional online presence for your business, portfolio or
          brand without a developer.
        </p>
        <Link
          href="/register"
          className="inline-block mt-8 px-8 py-4 rounded-xl font-bold bg-brand hover:bg-brand-dark transition shadow-lg shadow-brand/25"
        >
          Start building — it’s free
        </Link>
      </section>
    </main>
  );
}