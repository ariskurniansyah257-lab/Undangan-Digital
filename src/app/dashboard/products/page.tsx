import { createClient } from "@/lib/supabase/server";
import ProductCatalog from "./ProductCatalog";
import type { Product, Package } from "@/lib/types";

export default async function DashboardProductsPage() {
  const supabase = await createClient();
  const [{ data: products }, { data: packages }] = await Promise.all([
    supabase.from("products").select("*").eq("is_active", true).order("created_at", { ascending: false }),
    supabase.from("packages").select("id, name").order("sort_order"),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Katalog Produk</h1>
        <p className="text-gray-500">
          Tambahan untuk undangan Anda, dikelompokkan per paket. Pilih produk lalu lanjut ke pembayaran.
        </p>
      </div>
      <ProductCatalog
        products={(products ?? []) as Product[]}
        packages={(packages ?? []) as Pick<Package, "id" | "name">[]}
      />
    </div>
  );
}
