import { createClient } from "@/lib/supabase/server";
import type { Theme, Package } from "@/lib/types";
import ThemesManager from "./ThemesManager";

export default async function AdminThemesPage() {
  const supabase = await createClient();
  const [{ data: themes }, { data: packages }] = await Promise.all([
    supabase.from("themes").select("*").order("sort_order"),
    supabase.from("packages").select("*").order("sort_order"),
  ]);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Tema / Template</h1>
      <ThemesManager initial={(themes ?? []) as Theme[]} packages={(packages ?? []) as Package[]} />
    </div>
  );
}
