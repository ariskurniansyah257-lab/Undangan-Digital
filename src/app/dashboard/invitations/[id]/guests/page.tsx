import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import GuestManager from "./GuestManager";
import type { Guest } from "@/lib/types";

export default async function GuestsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: inv } = await supabase
    .from("invitations")
    .select("id, slug, title, status, package_id")
    .eq("id", id)
    .maybeSingle();
  if (!inv) notFound();

  const [{ data: guests }, pkgRes] = await Promise.all([
    supabase.from("guests").select("*").eq("invitation_id", id).order("created_at", { ascending: false }),
    inv.package_id
      ? supabase.from("packages").select("max_guests").eq("id", inv.package_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const maxGuests = (pkgRes?.data as { max_guests?: number } | null)?.max_guests ?? 1000;

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/dashboard/invitations/${id}`} className="text-sm text-gray-500 hover:text-brand-600">
          ← Kembali ke editor
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">Kelola Tamu</h1>
        <p className="text-gray-500">
          {inv.title} · maksimal {maxGuests} tamu. Tiap tamu punya tautan personal.
        </p>
      </div>

      <GuestManager
        invitationId={id}
        slug={inv.slug}
        published={inv.status === "published"}
        maxGuests={maxGuests}
        initialGuests={(guests ?? []) as Guest[]}
      />
    </div>
  );
}
