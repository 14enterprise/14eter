import Logo from "@/components/Logo";
import type { FooterContent } from "@/lib/content-defaults";

export default function Footer({ c }: { c: FooterContent }) {
  return (
    <footer className="relative bg-black text-gray-400 pt-20 pb-10 border-t border-white/10 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px bg-gradient-to-r from-transparent via-brand to-transparent opacity-50 shadow-[0_0_20px_rgba(59,130,246,0.6)]" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-brand/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-6 z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <Logo large />
            <p className="text-sm leading-relaxed max-w-xs">{c.description}</p>
            <div className="flex gap-4">
              {(c.socials ?? []).map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow us on ${s.label}`}
                  className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-gray-400 hover:bg-brand hover:text-white transition-all duration-300 border border-gray-800 hover:border-brand uppercase text-xs font-bold"
                >
                  {s.letter}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Product</h4>
            <ul className="space-y-4 text-sm">
              {(c.productLinks ?? []).map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="hover:text-brand transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Company</h4>
            <ul className="space-y-4 text-sm">
              {(c.companyLinks ?? []).map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="hover:text-brand transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Get in Touch</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <span className="text-brand mt-1">📍</span>
                <span>{c.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-brand">📧</span>
                <a href={`mailto:${c.email}`} className="hover:text-brand transition-colors">
                  {c.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-brand">📞</span>
                <a
                  href={`tel:${c.phone.replace(/\s/g, "")}`}
                  className="hover:text-brand transition-colors"
                >
                  {c.phone}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} 14Eter Limited. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
