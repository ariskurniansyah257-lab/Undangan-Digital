"use client";

import { useState } from "react";
import Link from "next/link";
import PhoneMockup from "./PhoneMockup";
import AddToCartButton from "@/components/AddToCartButton";
import { themesByPackage } from "@/lib/themes";
import { formatIDR } from "@/lib/constants";

export default function ThemeExplorer({ prices }: { prices: Record<string, number> }) {
  const groups = themesByPackage();
  const [active, setActive] = useState(groups[0]?.slug ?? "basic");
  const current = groups.find((g) => g.slug === active) ?? groups[0];
  const price = prices[active] ?? 0;

  return (
    <div>
      {/* Tab paket — bisa digeser ke kanan */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {groups.map((g) => (
          <button
            key={g.slug}
            onClick={() => setActive(g.slug)}
            className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              active === g.slug
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-gray-300 bg-white text-gray-600 hover:border-brand-300"
            }`}
          >
            {g.name}
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${active === g.slug ? "bg-white/20" : "bg-gray-100"}`}>
              {g.themes.length}
            </span>
          </button>
        ))}
      </div>

      {/* Info paket aktif */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-gray-500">
          Paket <b className="text-gray-800">{current.name}</b> · mulai{" "}
          <span className="font-semibold text-brand-600">{formatIDR(price)}</span>
        </p>
        <AddToCartButton
          item={{ type: "package", refId: current.slug, name: `Paket ${current.name}`, price }}
          goToCart
          label={`Pesan Paket ${current.name}`}
          className="btn-primary px-4 py-1.5 text-xs"
        />
      </div>

      {/* Kartu tema — geser ke kanan (horizontal) */}
      <div className="-mx-4 mt-4 flex snap-x gap-4 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {current.themes.map((t) => (
          <div key={t.slug} className="flex w-[150px] shrink-0 snap-start flex-col items-center">
            <Link href={`/preview/${t.slug}`} className="transition-transform hover:scale-105">
              <PhoneMockup compact from={t.vars.coverFrom} to={t.vars.coverTo} />
            </Link>
            <h4 className="mt-2 text-center text-sm font-medium text-gray-900">{t.name}</h4>
            <div className="mt-2 flex gap-1.5">
              <Link href={`/preview/${t.slug}`} className="btn-outline px-2.5 py-1 text-[11px]">
                👁️ Preview
              </Link>
              <AddToCartButton
                item={{ type: "package", refId: current.slug, name: `Paket ${current.name} — ${t.name}`, price }}
                goToCart
                label="Pesan"
                className="btn-primary px-2.5 py-1 text-[11px]"
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-1 text-center text-xs text-gray-400">← geser untuk melihat tema lain →</p>
    </div>
  );
}
