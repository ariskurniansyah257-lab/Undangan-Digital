import { createClient } from "@/lib/supabase/server";
import type { Package, Theme } from "@/lib/types";
import NewInvitationForm from "./NewInvitationForm";

export default async function NewInvitationPage() {
  const supabase = await createClient();

  const [{ data: packages }, { data: themes }] = await Promise.all([
    supabase.from("packages").select("*").eq("is_active", true).order("sort_order"),
    supabase.from("themes").select("*").eq("is_active", true).order("sort_order"),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Buat Undangan</h1>
        <p className="text-gray-500">
          Pilih jenis acara, paket, dan tema untuk memulai draft.
        </p>
      </div>
      <NewInvitationForm
        packages={(packages ?? []) as Package[]}
        themes={(themes ?? []) as Theme[]}
      />
    </div>
  );
}
