"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatIDR } from "@/lib/constants";
import { getTheme } from "@/lib/themes";
import AddToCartButton from "@/components/AddToCartButton";
import PhoneMockup from "@/components/landing/PhoneMockup";
import type { Product, Package, Theme } from "@/lib/types";

export default function ProductCatalog({
  products,
  packages,
  themes,
}: {
  products: Product[];
  packages: Package[];
  themes: Theme[];
}) {
  const [active, setActive] = useState(packages[0]?.id ?? "");
  const pkg = packages.find((p) => p.id === active) ?? packages[0];
  const pkgPrice = (p: Package) => p.discount_price ?? p.price;

  const pkgThemes = useMemo(() => themes.filter((t) => t.package_id === active), [themes, active]);
  const pkgProducts = useMemo(() => products.filter((p) => p.package_id === active), [products, active]);
  const generalProducts = useMemo(() => products.filter((p) => !p.package_id), [products]);

  if (packages.length === 0) {
    return <div className="card p-10 text-center text-gray-400">Belum ada paket tersedia.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Tab paket */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {packages.map((p) => (
          <button
            key={p.id}
            onClick={() => setActive(p.id)}
            className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              active === p.id
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-gray-300 bg-white text-gray-600 hover:border-brand-300"
            }`}
          >
            {p.name}
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${active === p.id ? "bg-white/25" : "bg-gray-100"}`}>
              {themes.filter((t) => t.package_id === p.id).length}
            </span>
          </button>
        ))}
      </div>

      {pkg && (
        <p className="text-sm text-gray-500">
          Paket <b className="text-gray-800">{pkg.name}</b> · mulai{" "}
          <span className="font-semibold text-brand-600">{formatIDR(pkgPrice(pkg))}</span>
          {pkg.tagline ? ` · ${pkg.tagline}` : ""}
        </p>
      )}

      {/* Tema per paket */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-800">Tema {pkg?.name}</h2>
        {pkgThemes.length === 0 ? (
          <p className="text-sm text-gray-400">Belum ada tema untuk paket ini.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {pkgThemes.map((t) => {
              const style = getTheme(t.slug);
              return (
                <div key={t.id} className="flex flex-col items-center rounded-xl border border-gray-100 p-2">
                  <Link href={`/preview/${t.slug}`} target="_blank" className="transition-transform hover:scale-105">
                    <PhoneMockup compact from={style.vars.coverFrom} to={style.vars.coverTo} />
                  </Link>
                  <p className="mt-2 text-center text-sm font-medium text-gray-900">{t.name}</p>
                  <p className="text-xs text-brand-600">{pkg ? formatIDR(pkgPrice(pkg)) : ""}</p>
                  <div className="mt-2 flex w-full gap-1.5">
                    <Link href={`/preview/${t.slug}`} target="_blank" className="btn-outline flex-1 px-2 py-1 text-[11px]">
                      👁️ Preview
                    </Link>
                    {pkg && (
                      <AddToCartButton
                        item={{
                          type: "package",
                          refId: pkg.slug,
                          name: `Paket ${pkg.name} — ${t.name}`,
                          price: pkgPrice(pkg),
                          themeId: t.id,
                          themeSlug: t.slug,
                          image: t.preview_image ?? undefined,
                        }}
                        goToCart
                        label="🛒 Keranjang"
                        className="btn-primary flex-1 px-2 py-1 text-[11px]"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Produk tambahan untuk paket ini + umum */}
      {(pkgProducts.length > 0 || generalProducts.length > 0) && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-800">Produk Tambahan</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...pkgProducts, ...generalProducts].map((p) => (
              <div key={p.id} className="card flex flex-col overflow-hidden">
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image} alt={p.name} className="h-40 w-full object-cover" />
                ) : (
                  <div className="flex h-40 items-center justify-center bg-gray-100 text-gray-300">Tanpa gambar</div>
                )}
                <div className="flex flex-1 flex-col p-4">
                  <p className="font-medium text-gray-900">{p.name}</p>
                  {p.description && <p className="mt-1 line-clamp-2 text-sm text-gray-500">{p.description}</p>}
                  <p className="mt-2 text-lg font-bold text-brand-600">{formatIDR(p.price)}</p>
                  <div className="mt-3 flex-1" />
                  <AddToCartButton
                    item={{ type: "product", refId: p.id, name: p.name, price: p.price, image: p.image ?? undefined }}
                    goToCart
                    label="🛒 Beli & Bayar"
                    className="btn-primary w-full text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
