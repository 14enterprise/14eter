import type { SiteContent, SitePage, SiteTemplate } from "@/lib/site-templates";

type Theme = {
  name: string;
  hero: "left" | "center";
  vars: {
    "--bg": string;
    "--text": string;
    "--muted": string;
    "--surface": string;
    "--input": string;
    "--line": string;
    "--primary": string;
    "--alt": string;
    "--chrome": string;
    "--chromeText": string;
    "--radius": string;
  };
};

const THEMES: Record<string, Theme> = {
  aurora: {
    name: "aurora",
    hero: "left",
    vars: {
      "--bg": "#0e0f1d",
      "--text": "#eef0ff",
      "--muted": "#a7a9c9",
      "--surface": "#171a2e",
      "--input": "#101224",
      "--line": "rgba(255,255,255,.09)",
      "--primary": "#7c6cf6",
      "--alt": "#22d3ee",
      "--chrome": "rgba(14,15,29,.85)",
      "--chromeText": "#ffffff",
      "--radius": "18px",
    },
  },
  forest: {
    name: "forest",
    hero: "center",
    vars: {
      "--bg": "#08120c",
      "--text": "#ecf7ef",
      "--muted": "#9fb6a6",
      "--surface": "#10201a",
      "--input": "#0a1610",
      "--line": "rgba(255,255,255,.09)",
      "--primary": "#34d399",
      "--alt": "#a3e635",
      "--chrome": "rgba(8,18,12,.85)",
      "--chromeText": "#ffffff",
      "--radius": "14px",
    },
  },
  ember: {
    name: "ember",
    hero: "left",
    vars: {
      "--bg": "#170d09",
      "--text": "#fdf3ec",
      "--muted": "#c0a79a",
      "--surface": "#24170f",
      "--input": "#1a0f09",
      "--line": "rgba(255,255,255,.09)",
      "--primary": "#fb923c",
      "--alt": "#f87171",
      "--chrome": "rgba(23,13,9,.88)",
      "--chromeText": "#ffffff",
      "--radius": "20px",
    },
  },
  ocean: {
    name: "ocean",
    hero: "center",
    vars: {
      "--bg": "#06151b",
      "--text": "#ecfbfa",
      "--muted": "#9cc7cf",
      "--surface": "#0d222b",
      "--input": "#08181f",
      "--line": "rgba(255,255,255,.09)",
      "--primary": "#2dd4bf",
      "--alt": "#60a5fa",
      "--chrome": "rgba(6,21,27,.88)",
      "--chromeText": "#ffffff",
      "--radius": "16px",
    },
  },
  paper: {
    name: "paper",
    hero: "center",
    vars: {
      "--bg": "#faf8f4",
      "--text": "#1f1d19",
      "--muted": "#6b675f",
      "--surface": "#ffffff",
      "--input": "#ffffff",
      "--line": "rgba(20,16,8,.10)",
      "--primary": "#b45309",
      "--alt": "#166534",
      "--chrome": "rgba(250,248,244,.88)",
      "--chromeText": "#1f1d19",
      "--radius": "14px",
    },
  },
  royal: {
    name: "royal",
    hero: "left",
    vars: {
      "--bg": "#100a18",
      "--text": "#f7f0ff",
      "--muted": "#b9accf",
      "--surface": "#1b1230",
      "--input": "#130b22",
      "--line": "rgba(255,255,255,.10)",
      "--primary": "#e879f9",
      "--alt": "#a78bfa",
      "--chrome": "rgba(16,10,24,.88)",
      "--chromeText": "#ffffff",
      "--radius": "22px",
    },
  },
};

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export function slugify(text: string): string {
  const s = text
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return s || "myapp";
}

function brandMark(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 1) return `<span>${esc(words[0] ?? "Your Brand")}</span>`;
  return (
    `<span>${esc(words[0])}</span>` +
    words
      .slice(1)
      .map((w) => esc(w))
      .join(" ")
  );
}

function itemInitial(name: string): string {
  return esc((name.trim().charAt(0) || "•").toUpperCase());
}

export type NavLink = { id: string; label: string };

const SITE_CSS = `:root{--font:${'"Space Grotesk",system-ui,sans-serif'}--nav-line:var(--line)}
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{font-family:var(--font);background:var(--bg);color:var(--text);line-height:1.6;-webkit-font-smoothing:antialiased}
.container{width:min(1120px,92%);margin:0 auto}
a{color:inherit;text-decoration:none}
header{position:sticky;top:0;z-index:50;background:var(--chrome);backdrop-filter:blur(12px);border-bottom:1px solid var(--nav-line)}
.nav{display:flex;align-items:center;justify-content:space-between;height:64px}
.brand{font-weight:800;font-size:1.15rem;letter-spacing:-.02em;color:var(--chromeText)}
.brand span{color:var(--primary)}
.nav-links{display:flex;gap:4px;align-items:center}
.nav-link{font-size:.9rem;font-weight:600;color:var(--chromeText);opacity:.75;padding:8px 12px;border-radius:99px;transition:.2s}
.nav-link:hover{opacity:1;background:rgba(255,255,255,.07)}
.nav-link.active{opacity:1;color:var(--primary)}
.burger{display:none;background:none;border:1px solid var(--nav-line);color:var(--chromeText);border-radius:10px;width:42px;height:42px;font-size:1.2rem;cursor:pointer}
.hero{position:relative;overflow:hidden;padding:120px 0 100px}
.hero.has-bg{background-size:cover;background-position:center;background-repeat:no-repeat}
.hero.has-bg::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(4,5,12,.96) 0%,rgba(4,5,12,.95) 45%,rgba(4,5,12,.97) 100%);pointer-events:none;z-index:0}
.hero.has-bg.hero-light::after{background:linear-gradient(180deg,rgba(4,5,12,.96) 0%,rgba(4,5,12,.95) 45%,rgba(4,5,12,.97) 100%)}
.hero.has-bg .container{z-index:2}
.hero.has-bg::before{z-index:1;opacity:.35}
.hero.has-bg .hero-title{text-shadow:0 2px 24px rgba(0,0,0,.55);color:#fff}
.hero.has-bg .hero-sub{text-shadow:0 1px 12px rgba(0,0,0,.45);color:rgba(255,255,255,.82)}
.hero.has-bg.hero-light .hero-title{color:#fff;text-shadow:0 2px 24px rgba(0,0,0,.55)}
.hero.has-bg.hero-light .hero-sub{color:rgba(255,255,255,.82);text-shadow:0 1px 12px rgba(0,0,0,.45)}
.hero.has-bg .badge{background:rgba(0,0,0,.4);backdrop-filter:blur(6px)}
.hero.has-bg.hero-light .badge{background:rgba(0,0,0,.4);backdrop-filter:blur(6px)}
.hero.has-bg .btn.ghost{color:#fff;border-color:rgba(255,255,255,.25)}
.hero.has-bg.hero-light .btn.ghost{color:#fff;border-color:rgba(255,255,255,.25)}
.hero::before{content:"";position:absolute;top:-120px;left:50%;transform:translateX(-50%);width:760px;height:520px;background:radial-gradient(closest-side,var(--primary)26,transparent);pointer-events:none}
.hero .container{position:relative;text-align:center;display:flex;flex-direction:column;align-items:center}
.badge{display:inline-block;font-size:.72rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--primary);border:1px solid var(--primary);opacity:.9;background:transparent;padding:6px 14px;border-radius:99px}
h1.hero-title{font-size:clamp(2.1rem,5vw,3.6rem);font-weight:800;line-height:1.12;letter-spacing:-.03em;margin:22px 0 18px;max-width:24ch;margin-left:auto;margin-right:auto}
.hero-sub{color:var(--muted);font-size:clamp(1rem,2vw,1.2rem);max-width:52ch;margin:0 0 34px;margin-left:auto;margin-right:auto}
.hero-actions{display:flex;gap:12px;flex-wrap:wrap;justify-content:center}
.btn{display:inline-block;background:var(--primary);color:#fff;font-weight:700;padding:14px 26px;border-radius:var(--radius);transition:.2s}
.btn:hover{filter:brightness(1.1)}
.btn.ghost{background:transparent;border:1px solid var(--nav-line);color:var(--text)}
.section{padding:76px 0;border-top:1px solid var(--nav-line)}
.section-title{font-size:clamp(1.5rem,3vw,2.2rem);font-weight:800;letter-spacing:-.02em;margin-bottom:8px}
.section-lead{color:var(--muted);margin-bottom:32px;max-width:60ch}
.section-lead.wide{max-width:72ch;white-space:normal}
.card-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px}
.card-grid.gallery{grid-template-columns:repeat(auto-fill,minmax(260px,1fr))}
.card{background:var(--surface);border:1px solid var(--nav-line);border-radius:var(--radius);overflow:hidden;display:flex;flex-direction:column}
.thumb{width:100%;aspect-ratio:4/3;object-fit:cover;display:block}
.thumb.pad{display:flex;align-items:center;justify-content:center;font-size:3rem;font-weight:800;color:var(--primary);background:var(--primary)1a}
.card-body{padding:20px 22px 22px}
.card-body h3{font-size:1.02rem;margin-bottom:6px;display:flex;justify-content:space-between;gap:10px;align-items:baseline}
.price{color:var(--alt);font-weight:800;font-size:.92rem;white-space:nowrap}
.card-body p{color:var(--muted);font-size:.94rem}
.rows{display:grid;gap:16px;margin-top:8px}
.row{display:flex;gap:18px;align-items:flex-start;background:var(--surface);border:1px solid var(--nav-line);border-radius:var(--radius);padding:20px 22px}
.row-main{flex:1;min-width:0}
.row-main h3{font-size:1.05rem;display:flex;justify-content:space-between;gap:10px;align-items:baseline;margin-bottom:4px}
.row-main p{color:var(--muted);font-size:.95rem}
.row-thumb{flex:none}
.row-img{width:96px;height:96px;object-fit:cover;border-radius:14px;display:block}
.info-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;margin-top:26px}
.info-card{background:var(--surface);border:1px solid var(--nav-line);border-radius:var(--radius);padding:18px 20px}
.info-key{font-size:.7rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--primary);margin-bottom:4px}
.info-val{font-size:.95rem}
.contact-card{background:var(--surface);border:1px solid var(--nav-line);border-radius:calc(var(--radius) + 4px);padding:34px;max-width:640px;margin:0 auto}
.contact-list{list-style:none;display:grid;gap:10px;margin:24px 0}
.contact-list li{color:var(--muted)}
.socials{display:flex;flex-wrap:wrap;gap:8px}
.social{font-size:.8rem;font-weight:700;border:1px solid var(--nav-line);color:var(--muted);padding:8px 16px;border-radius:99px;transition:.2s}
.social:hover{color:var(--primary);border-color:var(--primary)}
.field{margin-bottom:16px}
.field label{display:block;font-size:.78rem;font-weight:700;color:var(--muted);margin-bottom:6px}
.field input,.field textarea{width:100%;background:var(--input);border:1px solid var(--nav-line);border-radius:12px;padding:13px 15px;color:var(--text);font:inherit;outline:none;transition:.2s}
.field input::placeholder,.field textarea::placeholder{color:var(--muted);opacity:.7}
.field input:focus,.field textarea:focus{border-color:var(--primary)}
form .btn{width:100%;border:none;cursor:pointer;text-align:center}
footer{border-top:1px solid var(--nav-line);padding:38px 0;color:var(--muted);font-size:.85rem}
footer .container{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;align-items:center}
footer a{text-decoration:none;color:var(--muted);opacity:.85}
footer a:hover{opacity:1;color:var(--primary)}
.foot-links{display:flex;gap:14px;align-items:center}
.reveal{opacity:0;transform:translateY(16px);transition:opacity .6s ease,transform .6s ease}
.reveal.in{opacity:1;transform:none}
.back-top{position:fixed;right:18px;bottom:18px;width:44px;height:44px;border-radius:50%;background:var(--primary);color:#fff;border:none;font-size:1.1rem;cursor:pointer;opacity:0;pointer-events:none;transition:.25s;z-index:60}
.back-top.show{opacity:1;pointer-events:auto}
@media (max-width:760px){
.nav-links{display:none;position:absolute;top:64px;left:0;right:0;flex-direction:column;align-items:stretch;background:var(--chrome);padding:14px;gap:4px;border-bottom:1px solid var(--nav-line)}
.nav-links.open{display:flex}
.nav-link{color:var(--chromeText);opacity:.75}
.burger{display:block}
.hero{padding:72px 0 60px}
.row{flex-direction:column}
.row-thumb{width:100%}
.row-img{width:100%;height:180px}
}`;

const SITE_JS = `(function(){
document.getElementById("year").textContent=String(new Date().getFullYear());
var burger=document.getElementById("burger"),nav=document.getElementById("nav");
burger.addEventListener("click",function(){var open=nav.classList.toggle("open");burger.setAttribute("aria-expanded",open?"true":"false");burger.textContent=open?"✕":"☰";});
document.querySelectorAll("[data-nav]").forEach(function(a){a.addEventListener("click",function(){nav.classList.remove("open");burger.textContent="☰";burger.setAttribute("aria-expanded","false");});});
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target);}});},{threshold:.12});
document.querySelectorAll(".reveal").forEach(function(el){io.observe(el);});
var topBtn=document.getElementById("backTop");
window.addEventListener("scroll",function(){topBtn.classList.toggle("show",window.scrollY>600);},{passive:true});
topBtn.addEventListener("click",function(){window.scrollTo({top:0,behavior:"smooth"});});
var form=document.querySelector("[data-form]");
if(form) form.addEventListener("submit",function(e){setTimeout(function(){e.target.reset();},900);});
})();`;

function themeFor(template: SiteTemplate): Theme {
  return THEMES[template.theme] ?? THEMES.aurora;
}

function navHtml(nav: NavLink[], active: string, homeHref = "#top"): string {
  const links = [
    `<a class="nav-link ${active === "home" ? "active" : ""}" href="${active === "home" ? "#top" : homeHref}" data-nav>Home</a>`,
    ...nav.map(
      (n) =>
        `<a class="nav-link ${active === n.id ? "active" : ""}" href="p/${encodeURIComponent(n.id)}" data-nav>${esc(n.label)}</a>`
    ),
  ];
  return links.join("");
}

function headHtml(
  title: string,
  description: string,
  canonical: string,
  vars: string,
  navLine: string
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${title}</title>
<meta name="description" content="${description}"/>
<link rel="canonical" href="https://${esc(canonical)}"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700;800&display=swap" rel="stylesheet"/>
<style>
:root{${vars}--nav-line:${navLine};}
${SITE_CSS}
</style>
</head>`;
}

function headerHtml(brand: string, nav: NavLink[], active: string, homeHref = "#top"): string {
  return `<header>
  <div class="container nav">
    <a href="${active === "home" ? "#top" : homeHref}" class="brand">${brandMark(brand)}</a>
    <nav class="nav-links" id="nav" aria-label="Main">
      ${navHtml(nav, active, homeHref)}
    </nav>
    <button class="burger" id="burger" aria-label="Toggle menu" aria-expanded="false">☰</button>
  </div>
</header>`;
}

function footerHtml(brand: string, adminHref = "admin"): string {
  return `<footer>
  <div class="container">
    <p>&copy; <span id="year"></span> ${esc(brand)}</p>
    <p class="foot-links">
      <a href="${adminHref}">Manage site</a>
      <a href="https://14eter.org">Powered by 14Eter</a>
    </p>
  </div>
</footer>

<button class="back-top" id="backTop" aria-label="Back to top">↑</button>
<script>${SITE_JS}</script>
</body>
</html>`;
}

export function renderSite(
  template: SiteTemplate,
  content: SiteContent,
  canonical: string,
  nav: NavLink[] = [],
  active: string = "home"
): string {
  const theme = themeFor(template);
  const vars = Object.entries(theme.vars)
    .map(([k, v]) => `${k}:${v};`)
    .join("");

  const brand = content.brand || "Your Brand";
  const brandName = esc(brand);
  const tagline = esc(content.tagline || template.tagline);
  const heroTitle = esc(content.heroTitle || `Welcome to ${brand}`);
  const heroSub = esc(content.heroSub);
  const itemsLabel = esc(template.itemsLabel);
  const metaDescription = esc(content.heroSub || content.tagline || template.tagline);
  const centerHero = theme.hero === "center";
  const paper = theme.name === "paper";
  const navLine = paper ? "rgba(20,16,8,.12)" : "rgba(255,255,255,.08)";

  const infoChips = [
    content.hours && ["Hours", esc(content.hours)],
    content.phone && ["Phone", esc(content.phone)],
    content.email && ["Email", esc(content.email)],
    content.address && ["Address", esc(content.address)],
  ].filter(Boolean) as [string, string][];

  const infoRows = infoChips
    .map(
      ([k, v]) =>
        `<div class="info-card reveal"><p class="info-key">${k}</p><p class="info-val">${v}</p></div>`
    )
    .join("");

  function toWhatsAppNumber(number: string): string {
    return number.replace(/\D/g, "");
  }

  const itemCards = content.items
    .map((it) => {
      const img = it.image?.trim();
      const thumb = img
        ? `<img class="thumb" loading="lazy" src="${esc(img)}" alt="${esc(it.name)}"/>`
        : `<div class="thumb pad">${itemInitial(it.name)}</div>`;
      const whatsappNum = toWhatsAppNumber(it.whatsapp ?? content.phone ?? "");
      const whatsappMsg = encodeURIComponent(`Hi, I'm interested in "${it.name}"${it.price ? ` (${it.price})` : ""}. Can you tell me more?`);
      const whatsappUrl = whatsappNum ? `https://wa.me/${whatsappNum}?text=${whatsappMsg}` : "#";
      const whatsappBtn = whatsappNum && it.orderButton !== false
        ? `<a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="btn whatsapp-btn" style="margin-top:12px;display:inline-flex;align-items:center;gap:8px;">💬 Order via WhatsApp</a>`
        : "";
      return `<div class="card reveal">${thumb}
        <div class="card-body">
          <h3>${esc(it.name)}${it.price?.trim() ? `<span class="price">${esc(it.price.trim())}</span>` : ""}</h3>
          <p>${esc(it.desc)}</p>
          ${whatsappBtn}
        </div>
      </div>`;
    })
    .join("");

  const itemRows = content.items
    .map((it) => {
      const img = it.image?.trim()
        ? `<img class="row-img" loading="lazy" src="${esc(it.image)}" alt="${esc(it.name)}"/>`
        : "";
      const whatsappNum = toWhatsAppNumber(it.whatsapp ?? content.phone ?? "");
      const whatsappMsg = encodeURIComponent(`Hi, I'm interested in "${it.name}"${it.price ? ` (${it.price})` : ""}. Can you tell me more?`);
      const whatsappUrl = whatsappNum ? `https://wa.me/${whatsappNum}?text=${whatsappMsg}` : "#";
      const whatsappBtn = whatsappNum && it.orderButton !== false
        ? `<a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="btn whatsapp-btn" style="margin-top:12px;display:inline-flex;align-items:center;gap:8px;">💬 Order via WhatsApp</a>`
        : "";
      return `
      <li class="row reveal">
        <div class="row-main">
          <h3>${esc(it.name)}${it.price?.trim() ? `<span class="price">${esc(it.price.trim())}</span>` : ""}</h3>
          <p>${esc(it.desc)}</p>
          ${whatsappBtn}
        </div>
        ${img ? `<div class="row-thumb">${img}</div>` : ""}
      </li>`;
    })
    .join("");

  const itemsBlock =
    template.layout === "list"
      ? `<ul class="rows" style="list-style:none">${itemRows}</ul>`
      : template.layout === "gallery" || template.layout === "splash"
        ? `<div class="card-grid gallery">${itemCards}</div>`
        : `<div class="card-grid">${itemCards}</div>`;

  const aboutSection = content.about?.trim()
    ? `<section class="section" id="about">
      <div class="container">
        <h2 class="section-title reveal">About</h2>
        <p class="section-lead reveal wide">${content.about.split("\n").map((l) => esc(l)).join("<br/>")}</p>
        ${infoRows ? `<div class="info-grid">${infoRows}</div>` : ""}
      </div>
    </section>`
    : "";

  const socials = content.socials
    .filter((s) => s.url?.trim())
    .map(
      (s) =>
        `<a class="social" target="_blank" rel="noopener" href="${esc(s.url.trim())}">${esc(s.label)}</a>`
    )
    .join("");

  const contactChips = [
    content.hours && `<li>🕒 ${esc(content.hours)}</li>`,
    content.phone && `<li>📞 ${esc(content.phone)}</li>`,
    content.email && `<li>✉️ ${esc(content.email)}</li>`,
    content.address && `<li>📍 ${esc(content.address)}</li>`,
  ]
    .filter(Boolean)
    .join("");

  const heroStyles = centerHero
    ? ""
    : "<style>.hero::before{left:auto;right:-160px;transform:none}.hero .container{text-align:left;align-items:flex-start}h1.hero-title{margin-left:0;margin-right:0}.hero-actions{justify-content:flex-start}</style>";

  const heroImg = template.image?.trim() ?? "";
  const heroBgClass = heroImg ? ` has-bg${paper ? " hero-light" : ""}` : "";
  const heroBgStyle = heroImg ? ` style="background-image:url('${esc(heroImg)}')"` : "";

  return `${headHtml(
    `${brandName} — ${tagline.replace(/\.$/, "")}`,
    metaDescription,
    canonical,
    vars,
    navLine
  )}
<body>
<div id="top"></div>
${headerHtml(brand, nav, active)}

<section class="hero${heroBgClass}"${heroBgStyle}>
  <div class="container">
    <span class="badge reveal">● Live now · ${esc(canonical)}</span>
    <h1 class="hero-title reveal">${heroTitle}</h1>
    ${heroSub ? `<p class="hero-sub reveal">${heroSub}</p>` : `<p class="hero-sub reveal">${tagline}</p>`}
    <div class="hero-actions reveal">
      <a href="#contact" class="btn">${esc(content.cta || template.cta)}</a>
      <a href="#items" class="btn ghost">${itemsLabel}</a>
    </div>
  </div>
  ${heroStyles}
</section>

<section class="section" id="items">
  <div class="container">
    <h2 class="section-title reveal">${itemsLabel}</h2>
    <p class="section-lead reveal">${esc(content.tagline || template.tagline)}</p>
    ${itemsBlock}
  </div>
</section>

${aboutSection}

<section class="section" id="contact">
  <div class="container">
    <h2 class="section-title reveal">Get in touch</h2>
    <p class="section-lead reveal">We would love to hear from you — send us a message or reach us directly.</p>
    <div class="contact-card reveal">
      <form id="contact-form" data-form>
        <input type="hidden" name="phone" value="${esc(content.phone || "")}"/>
        <div class="field"><label for="cf-name">Name</label><input id="cf-name" name="name" type="text" required placeholder="Your name"/></div>
        <div class="field"><label for="cf-email">Email</label><input id="cf-email" name="email" type="email" required placeholder="you@email.com"/></div>
        <div class="field"><label for="cf-msg">Message</label><textarea id="cf-msg" name="message" rows="5" required placeholder="How can we help?"></textarea></div>
        <button type="submit" class="btn">Send via WhatsApp</button>
      </form>
    </div>
    ${contactChips ? `<ul class="contact-list keep">${contactChips}</ul>` : ""}
    ${socials ? `<div class="socials keep">${socials}</div>` : ""}
  </div>
</section>
<script>
(function(){
  var form = document.getElementById('contact-form');
  if(!form) return;
  form.addEventListener('submit', async function(e){
    e.preventDefault();
    var btn = form.querySelector('button[type=submit]');
    var original = btn ? btn.textContent : '';
    if(btn){ btn.disabled = true; btn.textContent = 'Opening WhatsApp...'; }
    var data = new FormData(form);
    var payload = { name: data.get('name'), email: data.get('email'), message: data.get('message'), phone: data.get('phone') };
    try{
      var res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      var json = await res.json().catch(function(){ return {}; });
      if(json.whatsappUrl){ window.location.href = json.whatsappUrl; }
      else if(!res.ok){ throw new Error(json.error || 'Failed'); }
    }catch(err){
      if(btn){ btn.disabled = false; btn.textContent = original || 'Send via WhatsApp'; }
      alert('Could not open WhatsApp. Please try again.');
    }
  });
})();
</script>

${footerHtml(brand)}
`;
}

export function renderPage(
  template: SiteTemplate,
  page: SitePage,
  canonical: string,
  nav: NavLink[] = [],
  active: string,
  brand: string,
  phone: string = ""
): string {
  const theme = themeFor(template);
  const vars = Object.entries(theme.vars)
    .map(([k, v]) => `${k}:${v};`)
    .join("");
  const paper = theme.name === "paper";
  const navLine = paper ? "rgba(20,16,8,.12)" : "rgba(255,255,255,.08)";

  function toWhatsAppNumber(number: string): string {
    return number.replace(/\D/g, "");
  }

  const itemCards = (page.items ?? [])
    .map((it) => {
      const img = it.image?.trim();
      const thumb = img
        ? `<img class="thumb" loading="lazy" src="${esc(img)}" alt="${esc(it.name)}"/>`
        : `<div class="thumb pad">${itemInitial(it.name)}</div>`;
      const whatsappNum = toWhatsAppNumber(it.whatsapp ?? phone ?? "");
      const whatsappMsg = encodeURIComponent(`Hi, I'm interested in "${it.name}"${it.price ? ` (${it.price})` : ""}. Can you tell me more?`);
      const whatsappUrl = whatsappNum ? `https://wa.me/${whatsappNum}?text=${whatsappMsg}` : "#";
      const whatsappBtn = whatsappNum && it.orderButton !== false
        ? `<a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="btn whatsapp-btn" style="margin-top:12px;display:inline-flex;align-items:center;gap:8px;">💬 Order via WhatsApp</a>`
        : "";
      return `<div class="card reveal">${thumb}
        <div class="card-body">
          <h3>${esc(it.name)}${it.price?.trim() ? `<span class="price">${esc(it.price.trim())}</span>` : ""}</h3>
          <p>${esc(it.desc)}</p>
          ${whatsappBtn}
        </div>
      </div>`;
    })
    .join("");

  const itemsBlock = page.items?.length
    ? `<section class="section" id="items">
      <div class="container">
        <h2 class="section-title reveal">${esc(page.title)}</h2>
        ${itemCards ? `<div class="card-grid">${itemCards}</div>` : ""}
      </div>
    </section>`
    : "";

  const photos = (page.photos ?? []).filter((p) => p && p.trim());
  const photosBlock = photos.length
    ? `<section class="section" id="photos">
      <div class="container">
        <h2 class="section-title reveal">Photos</h2>
        <div class="card-grid gallery">${photos
          .map(
            (src, i) =>
              `<div class="card reveal"><img class="thumb" loading="lazy" src="${esc(src)}" alt="${esc(page.title)} photo ${i + 1}"/></div>`
          )
          .join("")}</div>
      </div>
    </section>`
    : "";

  const introBlock = page.intro?.trim()
    ? `<div class="hero-sub reveal" style="margin-top:-18px">${page.intro
        .split("\n")
        .map((l) => esc(l))
        .join("<br/>")}</div>`
    : "";

  const heroImg = template.image?.trim() ?? "";
  const heroBgClass = heroImg ? ` has-bg${paper ? " hero-light" : ""}` : "";
  const heroBgStyle = heroImg ? ` style="background-image:url('${esc(heroImg)}')"` : "";

  return `${headHtml(
    `${esc(page.title)} · ${esc(brand)}`,
    esc(page.intro || page.title),
    canonical,
    vars,
    navLine
  )}
<body>
<div id="top"></div>
${headerHtml(brand, nav, active, "../..")}

<section class="hero${heroBgClass}"${heroBgStyle}>
  <div class="container">
    <span class="badge reveal">${esc(brand)}</span>
    <h1 class="hero-title reveal">${esc(page.heroTitle || page.title)}</h1>
    ${introBlock}
    <div class="hero-actions reveal">
      <a href="../.." class="btn">← Back to home</a>
    </div>
  </div>
</section>

${photosBlock}

${itemsBlock}

<section class="section" id="contact">
  <div class="container">
    <h2 class="section-title reveal">Get in touch</h2>
    <p class="section-lead reveal">Want to know more? Reach out and we will get back to you.</p>
    <div class="contact-card reveal">
      <p class="section-lead" style="margin-bottom:0;text-align:center">
        <a href="../.." class="btn">Back to homepage</a>
      </p>
    </div>
  </div>
</section>

${footerHtml(brand, "../../admin")}
</body>
</html>`;
}