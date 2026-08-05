import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EVENT_TYPES } from "@/lib/constants";
import ComingSoon from "@/components/ComingSoon";
import type { Invitation } from "@/lib/types";

export default async function InvitationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("invitations")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) notFound();
  const inv = data as Invitation;
  const eventLabel =
    EVENT_TYPES.find((e) => e.value === inv.event_type)?.label ??
    inv.event_type;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/dashboard/invitations"
            className="text-sm text-gray-500 hover:text-brand-600"
          >
            ← Kembali
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">
            {inv.title || "Tanpa judul"}
          </h1>
          <p className="text-gray-500">
            {eventLabel} · /{inv.slug}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            inv.status === "published"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {inv.status === "published" ? "Publik" : "Draft"}
        </span>
      </div>

      <ComingSoon
        phase="Fase 2"
        title="Editor undangan sedang dibangun"
        description="Editor lengkap (data mempelai, rangkaian acara, ayat/kutipan, gift, galeri, our journey, lagu, dan manajemen tamu dengan auto-generate link) hadir di fase berikutnya. Struktur data & tabelnya sudah siap di database."
      />
    </div>
  );
}
