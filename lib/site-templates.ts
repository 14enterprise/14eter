export type Category = {
  id: string;
  name: string;
  icon: string;
  tagline: string;
};

export const CATEGORIES: Category[] = [
  { id: "business", name: "Business & Services", icon: "🏢", tagline: "Agencies, consultants, professionals" },
  { id: "restaurant", name: "Restaurant & Cafe", icon: "🍽️", tagline: "Restaurants, cafes, food trucks" },
  { id: "realestate", name: "Real Estate", icon: "🏡", tagline: "Agents, agencies, property listings" },
  { id: "fitness", name: "Fitness & Health", icon: "💪", tagline: "Gyms, trainers, wellness studios" },
  { id: "fashion", name: "Fashion & Beauty", icon: "👗", tagline: "Studios, salons, boutiques" },
  { id: "portfolio", name: "Portfolio & Photography", icon: "📸", tagline: "Creatives, photographers, artists" },
  { id: "event", name: "Events & Party", icon: "🎉", tagline: "Event planners, decor, rentals" },
  { id: "education", name: "Education & Coaching", icon: "🎓", tagline: "Schools, tutors, coaches" },
  { id: "construction", name: "Design & Construction", icon: "🏗️", tagline: "Architects, builders, design firms" },
  { id: "ecommerce", name: "Online Store", icon: "🛍️", tagline: "Shops, boutiques, digital products" },
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

export type TemplateLayout = "grid" | "list" | "splash" | "gallery";

export const TEMPLATE_THEMES = [
  "aurora",
  "forest",
  "ember",
  "ocean",
  "paper",
  "royal",
] as const;

export const TEMPLATE_LAYOUTS: TemplateLayout[] = ["grid", "list", "splash", "gallery"];

export type SiteTemplate = {
  id: string;
  category: string;
  name: string;
  tagline: string;
  description: string;
  theme: string;
  layout: TemplateLayout;
  itemsLabel: string;
  cta: string;
  image: string;
};

export const TEMPLATES: SiteTemplate[] = [
  {
    id: "signature",
    category: "business",
    name: "Signature",
    tagline: "Confident corporate site with a clean services grid.",
    description: "A professional presence for agencies, consultants and B2B firms.",
    theme: "aurora",
    layout: "grid",
    itemsLabel: "Our services",
    cta: "Get a quote",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop",
  },
  {
    id: "pulse",
    category: "business",
    name: "Pulse",
    tagline: "Bold, energetic agency style with a centered hero.",
    description: "Modern and punchy — perfect for startups and creative teams.",
    theme: "ocean",
    layout: "grid",
    itemsLabel: "What we do",
    cta: "Start a project",
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop",
  },
  {
    id: "bistro",
    category: "restaurant",
    name: "Bistro",
    tagline: "Cozy restaurant site with a menu list and opening hours.",
    description: "Warm and inviting — made for sit-down dining and cafes.",
    theme: "ember",
    layout: "list",
    itemsLabel: "Our menu",
    cta: "Book a table",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop",
  },
  {
    id: "munchies",
    category: "restaurant",
    name: "Munchies",
    tagline: "Vibrant fast-food site with a menu grid and specials.",
    description: "Bright and appetite-driven — great for fast food and takeout.",
    theme: "forest",
    layout: "grid",
    itemsLabel: "Menu",
    cta: "Order now",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=600&h=400&fit=crop",
  },
  {
    id: "estateview",
    category: "realestate",
    name: "EstateView",
    tagline: "Premium property site with clean listings.",
    description: "Sharp and trustworthy for real estate agents and developers.",
    theme: "royal",
    layout: "list",
    itemsLabel: "Listings",
    cta: "View listings",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop",
  },
  {
    id: "nestquest",
    category: "realestate",
    name: "NestQuest",
    tagline: "Friendly realty with a light, modern feel.",
    description: "Approachable and bright — ideal for boutique realty firms.",
    theme: "paper",
    layout: "grid",
    itemsLabel: "Featured homes",
    cta: "Explore homes",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop",
  },
  {
    id: "corefitness",
    category: "fitness",
    name: "CoreFitness",
    tagline: "High-energy gym site with class cards.",
    description: "Motivational and strong — built for gyms and fitness studios.",
    theme: "forest",
    layout: "splash",
    itemsLabel: "Classes",
    cta: "Join a class",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop",
  },
  {
    id: "flexbody",
    category: "fitness",
    name: "Flexbody",
    tagline: "Athletic trainer site with a bold splash hero.",
    description: "Personal training and coaching with real presence.",
    theme: "ember",
    layout: "splash",
    itemsLabel: "Programs",
    cta: "Get started",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop",
  },
  {
    id: "atelier",
    category: "fashion",
    name: "Atelier",
    tagline: "Elegant boutique site on a light, airy canvas.",
    description: "Refined and minimal — made for fashion labels and studios.",
    theme: "paper",
    layout: "splash",
    itemsLabel: "Collections",
    cta: "View collection",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop",
  },
  {
    id: "glow",
    category: "fashion",
    name: "Glow",
    tagline: "Vibrant beauty site with bold colors and a gallery grid.",
    description: "Confident and colorful — for salons, spas and beauty brands.",
    theme: "royal",
    layout: "gallery",
    itemsLabel: "Treatments",
    cta: "Book an appointment",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&h=400&fit=crop",
  },
  {
    id: "lens",
    category: "portfolio",
    name: "Lens",
    tagline: "Photography portfolio with large gallery cards.",
    description: "Let your work speak — clean cards, big images.",
    theme: "aurora",
    layout: "gallery",
    itemsLabel: "Selected work",
    cta: "View my work",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop",
  },
  {
    id: "canvas",
    category: "portfolio",
    name: "Canvas",
    tagline: "Artist portfolio with a striking ocean-toned grid.",
    description: "Minimal and atmospheric — perfect for creatives of all kinds.",
    theme: "ocean",
    layout: "gallery",
    itemsLabel: "Projects",
    cta: "See projects",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=400&fit=crop",
  },
  {
    id: "celebrate",
    category: "event",
    name: "Celebrate",
    tagline: "Warm event-planner site with service cards.",
    description: "Weddings, parties and decor — bright and joyful.",
    theme: "ember",
    layout: "grid",
    itemsLabel: "Packages",
    cta: "Plan my event",
    image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&h=400&fit=crop",
  },
  {
    id: "evently",
    category: "event",
    name: "Evently",
    tagline: "Modern events list with a clean, structured layout.",
    description: "Corporate events, rentals and coordination teams.",
    theme: "forest",
    layout: "list",
    itemsLabel: "Services",
    cta: "Get a quote",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop",
  },
  {
    id: "scholar",
    category: "education",
    name: "Scholar",
    tagline: "Focused academy site with a calm, centered hero.",
    description: "Schools and tutors that want authority and clarity.",
    theme: "ocean",
    layout: "splash",
    itemsLabel: "Courses",
    cta: "Enroll now",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=400&fit=crop",
  },
  {
    id: "learnly",
    category: "education",
    name: "Learnly",
    tagline: "Friendly coaching site with a light, personable layout.",
    description: "Coaches, mentors and course creators — warm and clear.",
    theme: "paper",
    layout: "list",
    itemsLabel: "Courses",
    cta: "Start learning",
    image: "https://images.unsplash.com/photo-1501504905252-473c87e0b77b?w=600&h=400&fit=crop",
  },
  {
    id: "blueprint",
    category: "construction",
    name: "Blueprint",
    tagline: "Clean architectural portfolio with structured project grids.",
    description: "Precision-focused design for architecture studios and design firms.",
    theme: "paper",
    layout: "grid",
    itemsLabel: "Projects",
    cta: "View portfolio",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop",
  },
  {
    id: "structura",
    category: "construction",
    name: "Structura",
    tagline: "Bold construction site with strong typography and project showcases.",
    description: "Commanding presence for builders, contractors, and developers.",
    theme: "royal",
    layout: "splash",
    itemsLabel: "Our work",
    cta: "Start a project",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop",
  },
  {
    id: "foundation",
    category: "construction",
    name: "Foundation",
    tagline: "Refined design-build site with elegant service cards and process flow.",
    description: "Sophisticated layout for design-build firms and renovation experts.",
    theme: "forest",
    layout: "list",
    itemsLabel: "Services",
    cta: "Request consultation",
    image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&h=400&fit=crop",
  },
  {
    id: "elevation",
    category: "construction",
    name: "Elevation",
    tagline: "Modern architectural gallery with immersive project presentations.",
    description: "Striking visual-forward design for high-end architecture practices.",
    theme: "ocean",
    layout: "gallery",
    itemsLabel: "Selected projects",
    cta: "Explore work",
    image: "https://images.unsplash.com/photo-1487958449943-2429e814684e?w=600&h=400&fit=crop",
  },
  {
    id: "boutique",
    category: "ecommerce",
    name: "Boutique",
    tagline: "Elegant fashion store with refined product grids and smooth checkout flow.",
    description: "Sophisticated design for clothing, accessories, and lifestyle brands.",
    theme: "paper",
    layout: "grid",
    itemsLabel: "Shop collection",
    cta: "Shop now",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop",
  },
  {
    id: "marketplace",
    category: "ecommerce",
    name: "Marketplace",
    tagline: "Multi-category store with clean navigation and featured collections.",
    description: "Versatile layout for general stores, electronics, and variety shops.",
    theme: "ocean",
    layout: "list",
    itemsLabel: "All products",
    cta: "Browse store",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop",
  },
  {
    id: "artisan",
    category: "ecommerce",
    name: "Artisan",
    tagline: "Handcrafted goods showcase with storytelling product cards.",
    description: "Warm, personal design for makers, crafters, and small-batch producers.",
    theme: "ember",
    layout: "gallery",
    itemsLabel: "Handmade items",
    cta: "Explore crafts",
    image: "https://images.unsplash.com/photo-1578749556568-6c2f5e8c5c75?w=600&h=400&fit=crop",
  },
  {
    id: "digital",
    category: "ecommerce",
    name: "Digital",
    tagline: "Sleek digital product store with instant delivery and license management.",
    description: "Modern tech-forward design for software, templates, courses, and downloads.",
    theme: "aurora",
    layout: "splash",
    itemsLabel: "Digital products",
    cta: "Get started",
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop",
  },
];

export const TEMPLATE_MAP = Object.fromEntries(TEMPLATES.map((t) => [t.id, t]));

export function templatesForCategory(categoryId: string): SiteTemplate[] {
  return TEMPLATES.filter((t) => t.category === categoryId);
}

export function getTemplate(id: string): SiteTemplate | null {
  return TEMPLATE_MAP[id] ?? null;
}

export type SiteItem = { name: string; desc: string; price?: string; image?: string; whatsapp?: string; orderButton?: boolean };

export type SiteContent = {
  brand: string;
  tagline: string;
  heroTitle: string;
  heroSub: string;
  about: string;
  hours: string;
  phone: string;
  email: string;
  address: string;
  cta: string;
  items: SiteItem[];
  socials: { label: string; url: string }[];
};

function genericItems(label: string): SiteItem[] {
  return [
    {
      name: `${label} one`,
      desc: "A short description of this product or service goes here.",
      price: "",
      image: "",
    },
    {
      name: `${label} two`,
      desc: "Give each item its own short, friendly description.",
      price: "",
      image: "",
    },
    {
      name: `${label} three`,
      desc: "Add as many items as you like from the editor.",
      price: "",
      image: "",
    },
  ];
}

export function defaultContent(t: SiteTemplate): SiteContent {
  return {
    brand: "Your Brand",
    tagline: t.tagline,
    heroTitle: `Welcome to Your Brand`,
    heroSub:
      "A short line that tells visitors exactly what you offer and why they should stick around.",
    about: "",
    hours: "Mon–Sat: 8:00am – 6:00pm",
    phone: "",
    email: "",
    address: "",
    cta: t.cta,
    items: genericItems(t.itemsLabel),
    socials: [
      { label: "Instagram", url: "" },
      { label: "X", url: "" },
      { label: "WhatsApp", url: "" },
    ],
  };
}

export function normalizeContent(raw: unknown, t: SiteTemplate): SiteContent {
  const r = (raw ?? {}) as Record<string, unknown>;
  const items = Array.isArray(r.items)
    ? r.items
        .slice(0, 40)
        .map((it) => {
          const i = (it ?? {}) as Record<string, unknown>;
          return {
            name: String(i.name ?? "").trim(),
            desc: String(i.desc ?? "").trim(),
            price: String(i.price ?? "").trim(),
            image: String(i.image ?? "").trim(),
            whatsapp: String(i.whatsapp ?? "").trim(),
            orderButton: i.orderButton !== false,
          };
        })
        .filter((i) => i.name || i.desc)
    : [];
  const socials = Array.isArray(r.socials)
    ? r.socials
        .slice(0, 12)
        .map((s) => {
          const v = (s ?? {}) as Record<string, unknown>;
          return { label: String(v.label ?? "").trim(), url: String(v.url ?? "").trim() };
        })
        .filter((s) => s.label)
    : [];
  return {
    brand: String(r.brand ?? "").trim().slice(0, 60) || "Your Brand",
    tagline: String(r.tagline ?? "").trim().slice(0, 160) || t.tagline,
    heroTitle: String(r.heroTitle ?? "").trim().slice(0, 160) || `Welcome to ${String(r.brand ?? "").trim() || "Your Brand"}`,
    heroSub: String(r.heroSub ?? "").trim().slice(0, 280),
    about: String(r.about ?? "").trim().slice(0, 2000),
    hours: String(r.hours ?? "").trim().slice(0, 120) || defaultContent(t).hours,
    phone: String(r.phone ?? "").trim().slice(0, 40),
    email: String(r.email ?? "").trim().slice(0, 120),
    address: String(r.address ?? "").trim().slice(0, 200),
    cta: String(r.cta ?? "").trim().slice(0, 40) || t.cta,
    items: items.length ? items : genericItems(t.itemsLabel),
    socials,
  };
}

export type SitePage = {
  id: string;
  slug: string;
  title: string;
  navLabel: string;
  heroTitle: string;
  intro: string;
  items: SiteItem[];
  photos: string[];
};

export function newPage(title: string): SitePage {
  const slug = slugifyPage(title || "new-page");
  return {
    id: slug,
    slug,
    title: title || "New page",
    navLabel: title || "More",
    heroTitle: title || "New page",
    intro:
      "Welcome to this page. Use the editor to tell your visitors what it is about.",
    items: [],
    photos: [],
  };
}

export function normalizePage(raw: unknown): SitePage | null {
  const r = (raw ?? {}) as Record<string, unknown>;
  const title = String(r.title ?? "").trim().slice(0, 80);
  if (!title) return null;
  const items = Array.isArray(r.items)
    ? r.items.slice(0, 40).map((it) => {
        const i = (it ?? {}) as Record<string, unknown>;
        return {
          name: String(i.name ?? "").trim(),
          desc: String(i.desc ?? "").trim(),
          price: String(i.price ?? "").trim(),
          image: String(i.image ?? "").trim(),
          whatsapp: String(i.whatsapp ?? "").trim(),
          orderButton: i.orderButton !== false,
        };
      })
    : [];
  const photos = Array.isArray(r.photos)
    ? r.photos
        .slice(0, 12)
        .map((p) => String(p ?? "").trim())
        .filter((p) => p.length > 0)
    : [];
  return {
    id: String(r.id ?? "").trim() || slugifyPage(title),
    slug: slugifyPage(String(r.slug ?? "").trim() || title),
    title,
    navLabel: String(r.navLabel ?? "").trim().slice(0, 40) || title,
    heroTitle: String(r.heroTitle ?? "").trim().slice(0, 160) || title,
    intro: String(r.intro ?? "").trim().slice(0, 2000),
    items: items.filter((i) => i.name || i.desc),
    photos,
  };
}

export function slugifyPage(text: string): string {
  const s = text
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return s || "page";
}