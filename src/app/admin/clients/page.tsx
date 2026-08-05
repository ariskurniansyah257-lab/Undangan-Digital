import { createClient } from "@/lib/supabase/server";
import type { Profile, Package } from "@/lib/types";
import ClientsManager from "./ClientsManager";

export default async function AdminClientsPage() {
  const supabase = await createClient();
  const [{ data: profiles }, { data: packages }, { data: invCounts }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("packages").select("*").eq("is_active", true).order("sort_order"),
    supabase.from("invitations").select("user_id"),
  ]);

  const counts: Record<string, number> = {};
  (invCounts ?? []).forEach((r: any) => { counts[r.user_id] = (counts[r.user_id] ?? 0) + 1; });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Akun Client</h1>
      <ClientsManager
        profiles={(profiles ?? []) as Profile[]}
        packages={(packages ?? []) as Package[]}
        counts={counts}
      />
    </div>
  );
}
