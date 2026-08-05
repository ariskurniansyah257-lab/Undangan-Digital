"use client";

import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "beranda", label: "Beranda", icon: "🏠" },
  { id: "fitur", label: "Fitur", icon: "✨" },
  { id: "acara", label: "Acara", icon: "🎉" },
  { id: "tema", label: "Tema", icon: "🎨" },
  { id: "paket", label: "Paket", icon: "📦" },
  { id: "faq", label: "FAQ", icon: "❓" },
];

export default function SectionNav() {
  const [active, setActive] = useState("beranda");

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  function go(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="fixed right-3 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-1 rounded-full border border-gray-200 bg-white/90 p-1.5 shadow-lg backdrop-blur md:flex">
      {SECTIONS.map((s) => (
        <button
          key={s.id}
          onClick={() => go(s.id)}
          title={s.label}
          className={`group flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors ${
            active === s.id ? "bg-brand-600 text-white" : "text-gray-500 hover:bg-brand-50"
          }`}
        >
          <span>{s.icon}</span>
        </button>
      ))}
    </div>
  );
}
