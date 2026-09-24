"use client";

import { useEffect } from "react";

export const HERO_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1800&q=80",
    alt: "A team collaborating on a software project",
  },
  {
    src: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1800&q=80",
    alt: "A laptop showing source code",
  },
  {
    src: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1800&q=80",
    alt: "Colleagues working together around laptops",
  },
  {
    src: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1800&q=80",
    alt: "A glowing network of global digital connections",
  },
];

export default function HeroImageFlow({
  active,
  onSelect,
  interval = 5000,
}: {
  active: number;
  onSelect: (i: number) => void;
  interval?: number;
}) {
  useEffect(() => {
    const id = setInterval(() => onSelect((active + 1) % HERO_IMAGES.length), interval);
    return () => clearInterval(id);
  }, [active, interval, onSelect]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-black" aria-hidden="true">
      {HERO_IMAGES.map((img, i) => (
        <img
          key={img.src}
          src={img.src}
          alt={img.alt}
          loading={i === 0 ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
          className={`hero-flow-img absolute inset-0 h-full w-full object-cover ${
            i === active ? "active" : ""
          }`}
        />
      ))}
    </div>
  );
}