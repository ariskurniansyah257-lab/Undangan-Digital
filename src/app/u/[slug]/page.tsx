import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EVENT_TYPES } from "@/lib/constants";
import type { Invitation } from "@/lib/types";

export const revalidate = 0;

export default async function PublicInvitationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ to?: string }>;
}) {
  const { slug } = await params;
  const { to } = await searchParams;
  const supabase = await createClient();

  const { data } = await supabase
    .from("invitations")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!data) notFound();
  const inv = data as Invitation;
  const eventLabel =
    EVENT_TYPES.find((e) => e.value === inv.event_type)?.label ??
    inv.event_type;

  const guestName = to ? decodeURIComponent(to) : "Tamu Undangan";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-brand-50 to-white px-4 text-center">
      <p className="text-sm uppercase tracking-widest text-brand-600">
        {eventLabel}
      </p>
      <h1 className="mt-3 font-serif text-4xl text-gray-900">{inv.title}</h1>

      {inv.quote_text && (
        <blockquote className="mt-6 max-w-xl text-gray-600">
          “{inv.quote_text}”
          {inv.quote_source && (
            <footer className="mt-2 text-sm text-gray-400">
              — {inv.quote_source}
            </footer>
          )}
        </blockquote>
      )}

      <div className="mt-10 rounded-xl border border-brand-100 bg-white px-6 py-4 shadow-sm">
        <p className="text-sm text-gray-500">Kepada Yth.</p>
        <p className="text-lg font-semibold text-gray-900">{guestName}</p>
      </div>

      <p className="mt-10 max-w-md text-sm text-gray-400">
        Tampilan tema penuh (galeri, hitung mundur, RSVP, lagu, dsb.) hadir di
        Fase 3.
      </p>
    </div>
  );
}
