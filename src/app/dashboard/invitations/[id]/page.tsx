import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import InvitationEditor from "./InvitationEditor";
import type { Invitation, Song, Package } from "@/lib/types";

export default async function InvitationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: inv } = await supabase
    .from("invitations")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!inv) notFound();

  const [{ data: events }, { data: banks }, { data: story }, { data: gallery }, { data: songs }, pkgRes] =
    await Promise.all([
      supabase.from("invitation_events").select("*").eq("invitation_id", id).order("sort_order"),
      supabase.from("invitation_banks").select("*").eq("invitation_id", id).order("sort_order"),
      supabase.from("invitation_story").select("*").eq("invitation_id", id).order("sort_order"),
      supabase.from("invitation_gallery").select("*").eq("invitation_id", id).order("sort_order"),
      supabase.from("songs").select("*").eq("is_active", true).order("title"),
      inv.package_id
        ? supabase.from("packages").select("*").eq("id", inv.package_id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/dashboard/invitations" className="text-sm text-gray-500 hover:text-brand-600">
            ← Kembali
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Editor Undangan</h1>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/invitations/${id}/guests`} className="btn-outline">
            👥 Kelola Tamu
          </Link>
          <a href={`/u/${inv.slug}`} target="_blank" rel="noreferrer" className="btn-outline">
            👁️ Pratinjau
          </a>
        </div>
      </div>

      <InvitationEditor
        invitation={inv as Invitation}
        initialEvents={events ?? []}
        initialBanks={banks ?? []}
        initialStory={story ?? []}
        initialGallery={gallery ?? []}
        songs={(songs ?? []) as Song[]}
        pkg={(pkgRes?.data as Package) ?? null}
      />
    </div>
  );
}
