"use client";

import { useEffect, useState } from "react";

const ITEMS = [
  { id: "beranda", label: "Home", icon: "🏠" },
  { id: "fitur", label: "Fitur", icon: "✨" },
  { id: "tema", label: "Tema", icon: "🎨" },
  { id: "paket", label: "Paket", icon: "📦" },
];

export default function HomeBottomNav({ whatsapp }: { whatsapp?: string }) {
  const [active, setActive] = useState("beranda");
  const wa = (whatsapp ?? "").replace(/[^0-9]/g, "");

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -45% 0px" },
    );
    ITEMS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  function go(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 py-1.5">
        {ITEMS.map((it) => (
          <button
            key={it.id}
            onClick={() => go(it.id)}
            className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1 text-[11px] transition-colors ${
              active === it.id ? "text-brand-600" : "text-gray-500 hover:text-brand-600"
            }`}
          >
            <span className="text-lg leading-none">{it.icon}</span>
            {it.label}
          </button>
        ))}
        {wa && (
          <a
            href={`https://wa.me/${wa}`}
            target="_blank"
            rel="noreferrer"
            className="flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1 text-[11px] text-gray-500 hover:text-green-600"
          >
            <span className="text-lg leading-none">💬</span>
            Kontak
          </a>
        )}
      </div>
    </nav>
  );
}
