import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Profile } from "./types";

/**
 * Mengambil profil user; bila belum ada (mis. trigger auth.users tidak
 * terpasang), buat dari metadata user sebagai fallback.
 */
export async function ensureProfile(
  supabase: SupabaseClient,
  user: User,
): Promise<Profile | null> {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (data) return data as Profile;

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const { data: created } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        full_name: (meta.full_name as string) ?? "",
        email: user.email ?? null,
        phone: (meta.phone as string) ?? null,
      },
      { onConflict: "id" },
    )
    .select("*")
    .maybeSingle();

  return (created as Profile) ?? null;
}
