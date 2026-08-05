import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { EVENT_TYPES } from "@/lib/constants";
import type { Invitation } from "@/lib/types";

export default async function InvitationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("invitations")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const invs = (data ?? []) as Invitation[];
  const eventLabel = (v: string) =>
    EVENT_TYPES.find((e) => e.value === v)?.label ?? v;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Undangan Saya</h1>
        <Link href="/dashboard/invitations/new" className="btn-primary">
          + Buat Undangan
        </Link>
      </div>

      {invs.length === 0 ? (
        <div className="card p-10 text-center text-gray-500">
          Belum ada undangan. Klik “Buat Undangan” untuk memulai.
        </div>
      ) : (
        <div className="card divide-y divide-gray-100">
          {invs.map((inv) => (
            <Link
              key={inv.id}
              href={`/dashboard/invitations/${inv.id}`}
              className="flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <div>
                <p className="font-medium text-gray-900">
                  {inv.title || "Tanpa judul"}
                </p>
                <p className="text-sm text-gray-500">
                  {eventLabel(inv.event_type)} · /{inv.slug}
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs ${
                  inv.status === "published"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {inv.status === "published" ? "Publik" : "Draft"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
