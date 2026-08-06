import { createClient } from "@/lib/supabase/server";
import type { Product, Package } from "@/lib/types";
import ProductsManager from "./ProductsManager";

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const [{ data }, { data: packages }] = await Promise.all([
    supabase.from("products").select("*").order("created_at", { ascending: false }),
    supabase.from("packages").select("*").order("sort_order"),
  ]);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Kelola Produk</h1>
      <ProductsManager
        initial={(data ?? []) as Product[]}
        packages={(packages ?? []) as Package[]}
      />
    </div>
  );
}
