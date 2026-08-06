import { createClient } from "@/lib/supabase/server";
import type { BankAdmin, Profile } from "@/lib/types";
import SettingsManager from "./SettingsManager";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const [{ data: settings }, { data: banks }, { data: profiles }] = await Promise.all([
    supabase.from("site_settings").select("*"),
    supabase.from("banks_admin").select("*").order("sort_order"),
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
  ]);

  const settingsMap: Record<string, string> = {};
  (settings ?? []).forEach((s: any) => (settingsMap[s.key] = s.value ?? ""));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
      <SettingsManager
        settings={settingsMap}
        banks={(banks ?? []) as BankAdmin[]}
        profiles={(profiles ?? []) as Profile[]}
      />
    </div>
  );
}
