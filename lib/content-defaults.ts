export type Cta = { label: string; href: string };

export type HeroContent = {
  badge: string;
  heading: string;
  paragraph: string;
  primaryCta: Cta;
  secondaryCta: Cta;
  whyTitle: string;
  whyBullets: string[];
};

export type ModelCard = { icon: string; title: string; body: string };

export type ModelContent = {
  badge: string;
  heading: string;
  paragraph: string;
  cards: ModelCard[];
};

export type ProcessStep = { num: string; title: string; body: string };

export type ProcessContent = {
  badge: string;
  heading: string;
  steps: ProcessStep[];
};

export type Partner = {
  name: string;
  tag: string;
  website?: string;
  color?: string;
  logo?: string;
};

export type Product = { name: string; url: string };

export type ProductsContent = {
  products: Product[];
};

export type PartnersContent = {
  badge: string;
  heading: string;
  paragraph: string;
  partners: Partner[];
};

export type SocialLink = { label: string; href: string };

export type ContactContent = {
  badge: string;
  heading: string;
  paragraph: string;
  phone: string;
  email: string;
  address: string;
  socials: SocialLink[];
};

export type FooterLink = { label: string; href: string };

export type FooterSocial = FooterLink & { letter: string };

export type FooterContent = {
  description: string;
  socials: FooterSocial[];
  productLinks: FooterLink[];
  companyLinks: FooterLink[];
  address: string;
  email: string;
  phone: string;
};

export type PageHeroContent = {
  badge: string;
  heading: string;
  paragraph: string;
};

export type StoryContent = {
  heading: string;
  paragraph: string;
};

export type ValueCard = { icon: string; title: string; body: string };

export type ValuesContent = {
  badge: string;
  heading: string;
  values: ValueCard[];
};

export type CtaBannerContent = {
  heading: string;
  buttonLabel: string;
  buttonHref: string;
};

export type ContactInfoContent = {
  phone: string;
  email: string;
  address: string;
  socials: SocialLink[];
};

export type ContactFormContent = {
  formTitle: string;
  submitLabel: string;
  successTitle: string;
  successMessage: string;
};

export type SectionSeed = {
  key: string;
  label: string;
  sort: number;
  content?: unknown;
};

export type PageSeed = {
  slug: string;
  title: string;
  sections: SectionSeed[];
};

export type ContractClause = { heading: string; body: string };

export type ContractTemplateContent = {
  title: string;
  intro: string;
  clauses: ContractClause[];
  closing: string;
};

export const DEFAULT_CONTENT: Record<string, unknown> = {
  hero: {
    badge: "🚀 Innovating for the Future",
    heading: "Digital Solutions That Drive Growth",
    paragraph:
      "We build powerful software, design stunning brands, and craft digital strategies tailored for your business success.",
    primaryCta: { label: "Get Started", href: "#contact" },
    secondaryCta: { label: "Learn More", href: "#model" },
    whyTitle: "Why Choose Us?",
    whyBullets: [
      "Top-tier professionals committed to quality.",
      "Innovative solutions tailored to your needs.",
      "Affordable pricing without compromising excellence.",
    ],
  } satisfies HeroContent,
  model: {
    badge: "Partnership Model",
    heading: "Build With Skin in the Game",
    paragraph:
      "We partner with ambitious startups through an equity-inclusive model that aligns our success with yours.",
    cards: [
      {
        icon: "⚙️",
        title: "Technical Execution",
        body: "14Eter Limited handles the core software engineering and technical architecture. We build robust, scalable applications tailored directly to your roadmap.",
      },
      {
        icon: "🤝",
        title: "Equity-Aligned Incentives",
        body: "We believe in shared long-term success. Combining a base development fee with an equity stake aligns our goals directly with your company's valuation.",
      },
    ],
  } satisfies ModelContent,
  process: {
    badge: "How We Work",
    heading: "From Idea to Scale",
    steps: [
      {
        num: "1",
        title: "Client Infrastructure Setup",
        body: "Your designated Project Manager sets up required operational services—including hosting, databases, and third-party APIs.",
      },
      {
        num: "2",
        title: "Milestone Development",
        body: "14Eter Limited executes the technical builds based on agreed milestone schedules to deliver secure, functional code.",
      },
      {
        num: "3",
        title: "Long-Term Support",
        body: "We provide ongoing technical engineering and application maintenance to help your product scale smoothly as you grow.",
      },
    ],
  } satisfies ProcessContent,
  partners: {
    badge: "Our Clients & Partners",
    heading: "Trusted for Development",
    paragraph:
      "Companies we've partnered with to design, build, and scale their products.",
    partners: [
      {
        name: "NovaPay",
        tag: "Fintech",
        website: "https://novapay.ng",
        color: "#38bdf8",
        logo: "",
      },
      {
        name: "FarmLink",
        tag: "AgriTech",
        website: "https://farmlink.ng",
        color: "#4ade80",
        logo: "",
      },
      {
        name: "MedTrack",
        tag: "HealthTech",
        website: "https://medtrack.ng",
        color: "#f472b6",
        logo: "",
      },
      {
        name: "EduSphere",
        tag: "EdTech",
        website: "https://edusphere.ng",
        color: "#fbbf24",
        logo: "",
      },
      {
        name: "ShopSmart",
        tag: "E-Commerce",
        website: "https://shopsmart.ng",
        color: "#f87171",
        logo: "",
      },
      {
        name: "LogistiX",
        tag: "Logistics",
        website: "https://logistix.ng",
        color: "#a78bfa",
        logo: "",
      },
    ],
  } satisfies PartnersContent,
  products: {
    products: [
      { name: "14Eter CRM", url: "https://crm.14eter.org" },
      { name: "14Eter Pay", url: "https://pay.14eter.org" },
      { name: "14Eter Commerce", url: "https://store.14eter.org" },
    ],
  } satisfies ProductsContent,
  contact: {
    badge: "Get In Touch",
    heading: "Let's Build Something Great Together",
    paragraph:
      "Have a project in mind? Looking for a technical partner who shares your long-term vision? We'd love to hear from you.",
    phone: "+234 911 5963 439",
    email: "info@14eter.org",
    address: "No 30 Church Street, Mowe, Lagos Ibadan Express Way",
    socials: [
      { label: "WhatsApp", href: "https://wa.me/2349115963439" },
      { label: "Instagram", href: "https://instagram.com/14eter" },
      { label: "LinkedIn", href: "https://linkedin.com/company/14eter" },
      { label: "X", href: "https://x.com/14eter" },
      { label: "TikTok", href: "https://tiktok.com/@14eter" },
    ],
  } satisfies ContactContent,
  footer: {
    description:
      "Innovating for the future. We build digital experiences that empower businesses to grow and succeed in the modern world.",
    socials: [
      { label: "whatsapp", letter: "w", href: "https://wa.me/2349115963439" },
      { label: "instagram", letter: "i", href: "https://instagram.com/14eter" },
      { label: "linkedin", letter: "l", href: "https://linkedin.com/company/14eter" },
      { label: "twitter", letter: "t", href: "https://x.com/14eter" },
      { label: "tiktok", letter: "k", href: "https://tiktok.com/@14eter" },
    ],
    productLinks: [
      { label: "Marketplace", href: "#" },
      { label: "AI Planner", href: "#model" },
      { label: "Case Studies", href: "#process" },
      { label: "Pricing", href: "#" },
    ],
    companyLinks: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Contact", href: "/contact" },
      { label: "Partner Login", href: "/login" },
    ],
    address: "No 30 Church Street, Mowe, Lagos Ibadan Express Way",
    email: "info@14eter.org",
    phone: "+234 911 5963 439",
  } satisfies FooterContent,
  pageHero: {
    badge: "About Us",
    heading: "We Build Partnerships, Not Just Products",
    paragraph:
      "Get to know the team behind the code — and why we bet on our clients' success.",
  } satisfies PageHeroContent,
  story: {
    heading: "Our Story",
    paragraph:
      "14Eter Limited began with a simple belief: great software deserves more than a handoff. Too many agencies build, bill, and walk away — leaving founders with code they can't grow. We chose a different path. By pairing expert full-stack engineering with equity-aligned incentives, we embed ourselves in the businesses we serve. From hosting and infrastructure to long-term maintenance, we stay in the fight so our partners can focus on what they do best: building their company.",
  } satisfies StoryContent,
  values: {
    badge: "What Drives Us",
    heading: "Values That Shape Every Build",
    values: [
      {
        icon: "🎯",
        title: "Ownership First",
        body: "We treat every product like our own — because with skin in the game, it partly is.",
      },
      {
        icon: "🔍",
        title: "Transparency",
        body: "Milestones, code, and costs stay visible. No black boxes, no surprises.",
      },
      {
        icon: "🧠",
        title: "Engineering Excellence",
        body: "Secure, scalable architecture is non-negotiable on every project we ship.",
      },
      {
        icon: "♾️",
        title: "Long-Term Thinking",
        body: "Equity alignment means we only win when you win — our incentives prove it.",
      },
    ],
  } satisfies ValuesContent,
  ctaBanner: {
    heading: "Ready to build something that lasts?",
    buttonLabel: "Partner With Us",
    buttonHref: "/contact",
  } satisfies CtaBannerContent,
  contactInfo: {
    phone: "+234 911 5963 439",
    email: "info@14eter.org",
    address: "No 30 Church Street, Mowe, Lagos Ibadan Express Way",
    socials: [
      { label: "WhatsApp", href: "https://wa.me/2349115963439" },
      { label: "Instagram", href: "https://instagram.com/14eter" },
      { label: "LinkedIn", href: "https://linkedin.com/company/14eter" },
      { label: "X", href: "https://x.com/14eter" },
      { label: "TikTok", href: "https://tiktok.com/@14eter" },
    ],
  } satisfies ContactInfoContent,
  contactForm: {
    formTitle: "Send us a message",
    submitLabel: "Send Message",
    successTitle: "Message Sent ✓",
    successMessage: "Thanks for reaching out — we'll get back to you shortly.",
  } satisfies ContactFormContent,
  contractTemplate: {
    title: "Software Development & Equity Partnership Agreement",
    intro:
      "This Agreement is entered into between 14Eter Limited ('Developer'), located at No 30 Church Street, Mowe, Lagos Ibadan Express Way, and [CLIENT NAME] ('Client'), on [DATE]. The Developer agrees to provide software development services to the Client in exchange for a base development fee and an equity stake as set out below.",
    clauses: [
      {
        heading: "1. Scope of Work",
        body: "The Developer will design, build, and deliver the software described in the attached project specification. Any change to the scope must be agreed in writing by both parties before work continues.",
      },
      {
        heading: "2. Milestones & Payments",
        body: "Work is delivered in agreed milestones. The Client shall fund infrastructure costs (hosting, domains, third-party APIs) and pay milestone fees within 7 days of invoice. Delays in payment pause the delivery schedule.",
      },
      {
        heading: "3. Equity Grant",
        body: "In consideration of reduced cash fees, the Client grants the Developer [EQUITY PERCENTAGE] of the company's ordinary shares, vesting according to the schedule in Schedule A, subject to completion of milestones.",
      },
      {
        heading: "4. Intellectual Property",
        body: "Upon full payment of milestone fees, intellectual property for project-specific code transfers to the Client. The Developer retains rights to its general-purpose internal libraries and tooling.",
      },
      {
        heading: "5. Confidentiality",
        body: "Both parties agree to keep confidential information — technical, commercial, or otherwise — private during and after this Agreement for a period of three (3) years.",
      },
      {
        heading: "6. Support & Maintenance",
        body: "The Developer provides bug fixes and maintenance for [SUPPORT DURATION] following launch. Ongoing engineering retainers are billed monthly as separately agreed.",
      },
      {
        heading: "7. Termination",
        body: "Either party may terminate with 30 days' written notice. The Client pays for all completed milestones; unvested equity granted under Clause 3 is forfeited on termination for cause.",
      },
    ],
    closing:
      "Signed for and on behalf of the parties:\n\n14Eter Limited — Signature: ____________________  Date: ____________\n\n[CLIENT NAME] — Signature: ____________________  Date: ____________",
  } satisfies ContractTemplateContent,
};

export const PAGE_SEEDS: PageSeed[] = [
  {
    slug: "home",
    title: "Home",
    sections: [
      { key: "hero", label: "Hero", sort: 1 },
      { key: "model", label: "Partnership Model", sort: 2 },
      { key: "process", label: "How We Work", sort: 3 },
      { key: "partners", label: "Partners", sort: 4 },
      { key: "products", label: "Products", sort: 5 },
      { key: "contact", label: "Contact", sort: 6 },
      { key: "footer", label: "Footer", sort: 7 },
    ],
  },
  {
    slug: "about",
    title: "About",
    sections: [
      {
        key: "pageHero",
        label: "Page Header",
        sort: 1,
        content: {
          badge: "About Us",
          heading: "We Build Partnerships, Not Just Products",
          paragraph:
            "Get to know the team behind the code — and why we bet on our clients' success.",
        },
      },
      { key: "story", label: "Our Story", sort: 2 },
      { key: "values", label: "Our Values", sort: 3 },
      { key: "ctaBanner", label: "CTA Banner", sort: 4 },
    ],
  },
  {
    slug: "contact",
    title: "Contact",
    sections: [
      {
        key: "pageHero",
        label: "Page Header",
        sort: 1,
        content: {
          badge: "Get In Touch",
          heading: "Let's Start the Conversation",
          paragraph:
            "Tell us where you're headed — we'll show you how engineering plus equity gets you there faster.",
        },
      },
      { key: "contactInfo", label: "Contact Info", sort: 2 },
      { key: "contactForm", label: "Form Settings", sort: 3 },
    ],
  },
  {
    slug: "contract",
    title: "Contract",
    sections: [
      { key: "contractTemplate", label: "Agreement Template", sort: 1 },
    ],
  },
];
