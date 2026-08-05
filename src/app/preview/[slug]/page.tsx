import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { DEMO_INVITATION } from "@/lib/demo";
import { getTheme } from "@/lib/themes";
import InvitationExperience from "@/components/invitation/InvitationExperience";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const t = getTheme(slug);
  return { title: `Preview Tema ${t.name} — Undangan Digital` };
}

export default async function ThemePreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ to?: string }>;
}) {
  const { slug } = await params;
  const { to } = await searchParams;
  const theme = getTheme(slug);
  const guestName = to ? decodeURIComponent(to) : "Calon Tamu Anda";

  // Ambil harga paket untuk tombol "Pesan Tema Ini".
  let price = 0;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("packages")
      .select("price, discount_price")
      .eq("slug", theme.packageSlug)
      .maybeSingle();
    price = (data?.discount_price ?? data?.price) ?? 0;
  } catch {
    /* fallback */
  }

  return (
    <div className="min-h-screen" style={{ background: theme.vars.coverTo }}>
      <InvitationExperience
        data={DEMO_INVITATION}
        guestName={guestName}
        themeSlug={slug}
        previewMode
        orderItem={{
          type: "package",
          refId: theme.packageSlug,
          name: `Paket ${theme.packageName} — ${theme.name}`,
          price,
        }}
      />
    </div>
  );
}
