import { createClient } from "@/lib/supabase/server";
import type { Package, PackageFeature } from "@/lib/types";
import PackagesManager from "./PackagesManager";

export default async function AdminPackagesPage() {
  const supabase = await createClient();
  const [{ data: packages }, { data: features }] = await Promise.all([
    supabase.from("packages").select("*").order("sort_order"),
    supabase.from("package_features").select("*").order("sort_order"),
  ]);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Paket & Komparasi</h1>
      <p className="text-sm text-gray-500">Ubah harga, kapabilitas, dan baris komparasi yang tampil di home.</p>
      <PackagesManager
        packages={(packages ?? []) as Package[]}
        features={(features ?? []) as PackageFeature[]}
      />
    </div>
  );
}
