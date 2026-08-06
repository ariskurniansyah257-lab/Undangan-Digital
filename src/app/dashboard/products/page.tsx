import { createClient } from "@/lib/supabase/server";
import ProductCatalog from "./ProductCatalog";
import type { Product, Package, Theme } from "@/lib/types";

export default async function DashboardProductsPage() {
  const supabase = await createClient();
  const [{ data: products }, { data: packages }, { data: themes }] = await Promise.all([
    supabase.from("products").select("*").eq("is_active", true).order("created_at", { ascending: false }),
    supabase.from("packages").select("*").eq("is_active", true).order("sort_order"),
    supabase.from("themes").select("*").eq("is_active", true).order("sort_order"),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Katalog</h1>
        <p className="text-gray-500">
          Pilih tema per paket (atau produk tambahan), masukkan ke keranjang, lalu bayar.
        </p>
      </div>
      <ProductCatalog
        products={(products ?? []) as Product[]}
        packages={(packages ?? []) as Package[]}
        themes={(themes ?? []) as Theme[]}
      />
    </div>
  );
}
