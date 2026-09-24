"use client";

import { useEffect, useState } from "react";

export default function Preloader() {
  const [fading, setFading] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFading(true), 2300);
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    if (!fading) return;
    const t2 = setTimeout(() => setGone(true), 700);
    return () => clearTimeout(t2);
  }, [fading]);

  if (gone) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black transition-opacity duration-700 ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-brand/30 rounded-full blur-3xl animate-pulse" />
        <div className="relative z-10 flex items-center gap-1 mb-8 animate-[fadeIn_1s_ease-out]">
          <span className="text-5xl md:text-7xl font-black tracking-tighter text-white">
            <span className="text-brand inline-block animate-[slideDown_0.8s_ease-out]">
              14
            </span>
            <span className="inline-block animate-[slideUp_0.8s_ease-out]">Eter</span>
            <span className="text-accent inline-block animate-[bounce_1s_infinite]">.</span>
          </span>
        </div>
      </div>
      <div className="w-48 h-1 bg-gray-900 rounded-full overflow-hidden relative">
        <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-brand to-accent animate-[loading_2.2s_ease-in-out_forwards]" />
      </div>
      <p className="mt-4 text-gray-500 text-sm font-medium tracking-widest animate-pulse">
        LOADING
      </p>
    </div>
  );
}
