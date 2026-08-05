import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { DEMO_INVITATION } from "@/lib/demo";
import type {
  InvitationView,
  EventItem,
  BankItem,
  GalleryItem,
  StoryItem,
} from "@/lib/invitation-view";
import InvitationExperience from "@/components/invitation/InvitationExperience";

export const revalidate = 0;

function resolveGuest(to?: string): string {
  if (!to) return "Tamu Undangan";
  try {
    return decodeURIComponent(to).replace(/\+/g, " ");
  } catch {
    return to;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (slug === "demo") {
    return { title: `${DEMO_INVITATION.title} — Undangan Pernikahan` };
  }
  return { title: "Undangan Digital" };
}

/** Ambil undangan dari database dan petakan ke InvitationView. */
async function loadFromDb(slug: string): Promise<InvitationView | null> {
  const supabase = await createClient();
  const { data: inv } = await supabase
    .from("invitations")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (!inv) return null;

  const [{ data: events }, { data: banks }, { data: gallery }, { data: story }, song] =
    await Promise.all([
      supabase.from("invitation_events").select("*").eq("invitation_id", inv.id).order("sort_order"),
      supabase.from("invitation_banks").select("*").eq("invitation_id", inv.id).order("sort_order"),
      supabase.from("invitation_gallery").select("*").eq("invitation_id", inv.id).order("sort_order"),
      supabase.from("invitation_story").select("*").eq("invitation_id", inv.id).order("sort_order"),
      inv.song_id
        ? supabase.from("songs").select("url").eq("id", inv.song_id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

  const cfg = (inv.config ?? {}) as Record<string, any>;

  return {
    id: inv.id,
    slug: inv.slug,
    eventType: inv.event_type,
    title: inv.title,
    status: inv.status,
    quoteText: inv.quote_text,
    quoteSource: inv.quote_source,
    photoMode: inv.photo_mode,
    themeName: null,
    songUrl: (song?.data as { url?: string } | null)?.url ?? null,
    groom: cfg.groom ?? { name: "Mempelai Pria" },
    bride: cfg.bride ?? { name: "Mempelai Wanita" },
    mainDate: cfg.mainDate ?? (events?.[0]?.event_date ?? null),
    coupleTagline: cfg.coupleTagline ?? null,
    hashtag: cfg.hashtag ?? null,
    closingMessage: cfg.closingMessage ?? "Terima kasih atas doa dan restunya.",
    couplePhoto: cfg.couplePhoto ?? null,
    galleryMode: cfg.galleryMode === "slide" ? "slide" : "normal",
    videoUrl: cfg.videoUrl ?? null,
    events: (events ?? []).map(
      (e): EventItem => ({
        name: e.name,
        date: e.event_date,
        startTime: e.start_time?.slice(0, 5) ?? null,
        endTime: e.end_time?.slice(0, 5) ?? null,
        locationName: e.location_name,
        locationAddress: e.location_address,
        mapUrl: e.map_url,
      }),
    ),
    banks: (banks ?? []).map(
      (b): BankItem => ({
        bankName: b.bank_name,
        accountNumber: b.account_number,
        accountName: b.account_name,
      }),
    ),
    gallery: (gallery ?? []).map(
      (g): GalleryItem => ({ imageUrl: g.image_url, caption: g.caption }),
    ),
    story: (story ?? []).map(
      (s): StoryItem => ({ title: s.title, story: s.story, storyDate: s.story_date }),
    ),
  };
}

export default async function PublicInvitationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ to?: string }>;
}) {
  const { slug } = await params;
  const { to } = await searchParams;
  const guestName = resolveGuest(to);

  const data = slug === "demo" ? DEMO_INVITATION : await loadFromDb(slug);
  if (!data) notFound();

  return (
    <div className="min-h-screen bg-[#241715]">
      <InvitationExperience data={data} guestName={guestName} />
    </div>
  );
}
