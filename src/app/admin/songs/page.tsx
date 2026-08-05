import { createClient } from "@/lib/supabase/server";
import type { Song } from "@/lib/types";
import SongsManager from "./SongsManager";

export default async function AdminSongsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("songs").select("*").order("created_at", { ascending: false });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Kelola Lagu</h1>
      <SongsManager initial={(data ?? []) as Song[]} />
    </div>
  );
}
