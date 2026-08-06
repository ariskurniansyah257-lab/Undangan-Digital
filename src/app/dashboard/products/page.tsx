import { createClient } from "@/lib/supabase/server";
import { formatIDR } from "@/lib/constants";
import AddToCartButton from "@/components/AddToCartButton";
import type { Product, Package } from "@/lib/types";

export default async function DashboardProductsPage() {
  const supabase = await createClient();
  const [{ data: products }, { data: packages }] = await Promise.all([
    supabase.from("products").select("*").eq("is_active", true).order("created_at", { ascending: false }),
    supabase.from("packages").select("id, name").order("sort_order"),
  ]);
  const items = (products ?? []) as Product[];
  const pkgs = (packages ?? []) as Pick<Package, "id" | "name">[];
  const pkgName = (id: string | null) => pkgs.find((p) => p.id === id)?.name ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Katalog Produk</h1>
        <p className="text-gray-500">
          Tambahan untuk undangan Anda. Pilih produk lalu lanjut ke pembayaran.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="card p-10 text-center text-gray-400">Belum ada produk tersedia.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <div key={p.id} className="card flex flex-col overflow-hidden">
              {p.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image} alt={p.name} className="h-40 w-full object-cover" />
              ) : (
                <div className="flex h-40 items-center justify-center bg-gray-100 text-gray-300">Tanpa gambar</div>
              )}
              <div className="flex flex-1 flex-col p-4">
                <p className="font-medium text-gray-900">{p.name}</p>
                {pkgName(p.package_id) && (
                  <span className="mt-1 w-fit rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-600">
                    Paket {pkgName(p.package_id)}
                  </span>
                )}
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
      )}
    </div>
  );
}
