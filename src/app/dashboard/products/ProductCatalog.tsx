"use client";

import { useMemo, useState } from "react";
import { formatIDR } from "@/lib/constants";
import AddToCartButton from "@/components/AddToCartButton";
import type { Product, Package } from "@/lib/types";

const UMUM = "__umum__";

export default function ProductCatalog({
  products,
  packages,
}: {
  products: Product[];
  packages: Pick<Package, "id" | "name">[];
}) {
  // Grup tab: tiap paket + "Umum" untuk produk tanpa paket.
  const groups = useMemo(() => {
    const g: { key: string; label: string; items: Product[] }[] = [];
    for (const p of packages) {
      const items = products.filter((x) => x.package_id === p.id);
      if (items.length) g.push({ key: p.id, label: `Paket ${p.name}`, items });
    }
    const umum = products.filter((x) => !x.package_id);
    if (umum.length) g.push({ key: UMUM, label: "Umum", items: umum });
    return g;
  }, [products, packages]);

  const [active, setActive] = useState(groups[0]?.key ?? UMUM);
  const current = groups.find((g) => g.key === active) ?? groups[0];

  if (groups.length === 0) {
    return <div className="card p-10 text-center text-gray-400">Belum ada produk tersedia.</div>;
  }

  return (
    <div>
      {/* Tab per paket */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {groups.map((g) => (
          <button
            key={g.key}
            onClick={() => setActive(g.key)}
            className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              active === g.key
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-gray-300 bg-white text-gray-600 hover:border-brand-300"
            }`}
          >
            {g.label}
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${active === g.key ? "bg-white/25" : "bg-gray-100"}`}>
              {g.items.length}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {current.items.map((p) => (
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
                item={{ type: "product", refId: p.id, name: p.name, price: p.price }}
                goToCart
                label="🛒 Beli & Bayar"
                className="btn-primary w-full text-sm"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
