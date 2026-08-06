import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getTheme } from "@/lib/themes";
import PhoneMockup from "@/components/landing/PhoneMockup";
import CreateFromEntitlement from "./CreateFromEntitlement";
import type { Invitation } from "@/lib/types";

export default async function InvitationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: invData }, { data: themeData }, { data: pkgData }, { data: paidData }] =
    await Promise.all([
      supabase.from("invitations").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }),
      supabase.from("themes").select("id, slug, name, preview_image"),
      supabase.from("packages").select("id, name"),
      supabase
        .from("order_items")
        .select("package_id, theme_id, name, order_id, orders!inner(status, user_id)")
        .not("package_id", "is", null)
        .eq("orders.status", "berhasil")
        .eq("orders.user_id", user!.id),
    ]);

  const invs = (invData ?? []) as Invitation[];
  const themeById = new Map((themeData ?? []).map((t: any) => [t.id, t]));
  const pkgById = new Map((pkgData ?? []).map((p: any) => [p.id, p.name]));

  // Entitlement paket/tema berbayar yang belum dijadikan undangan (berdasar order).
  const usedOrderIds = new Set(invs.map((i) => i.order_id).filter(Boolean) as string[]);
  const entitlements = (paidData ?? []).filter((it: any) => !usedOrderIds.has(it.order_id));

  const previewColors = (themeId: string | null) => {
    const slug = themeId ? (themeById.get(themeId)?.slug as string | undefined) : undefined;
    const th = getTheme(slug);
    return { from: th.vars.coverFrom, to: th.vars.coverTo };
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Undangan Saya</h1>
        <Link href="/dashboard/invitations/new" className="btn-primary">
          + Buat Undangan
        </Link>
      </div>

      {/* Paket/tema sudah dibayar, siap dibuat undangannya */}
      {entitlements.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-800">Sudah Dibayar — Siap Dibuat</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {entitlements.map((it: any, i: number) => {
              const c = previewColors(it.theme_id);
              const themeName = it.theme_id ? themeById.get(it.theme_id)?.name : null;
              return (
                <div key={i} className="card flex flex-col items-center p-4">
                  <PhoneMockup compact from={c.from} to={c.to} />
                  <p className="mt-3 text-center font-medium text-gray-900">{it.name}</p>
                  <p className="mb-3 text-xs text-gray-500">
                    {pkgById.get(it.package_id) ?? "Paket"}{themeName ? ` · ${themeName}` : ""} · Lunas ✓
                  </p>
                  <div className="w-full">
                    <CreateFromEntitlement
                      packageId={it.package_id}
                      themeId={it.theme_id ?? null}
                      orderId={it.order_id}
                      title={it.name}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Undangan yang sudah dibuat */}
      <section>
        {entitlements.length > 0 && <h2 className="mb-3 text-lg font-semibold text-gray-800">Undangan Dibuat</h2>}
        {invs.length === 0 ? (
          <div className="card p-10 text-center text-gray-500">
            Belum ada undangan. Klik “Buat Undangan”, atau beli paket/tema di{" "}
            <Link href="/dashboard/products" className="text-brand-600">katalog</Link>.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {invs.map((inv) => {
              const c = previewColors(inv.theme_id);
              const themeName = inv.theme_id ? themeById.get(inv.theme_id)?.name : null;
              return (
                <div key={inv.id} className="card flex flex-col items-center p-4">
                  <Link href={`/dashboard/invitations/${inv.id}`}>
                    <PhoneMockup compact from={c.from} to={c.to} />
                  </Link>
                  <p className="mt-3 text-center font-medium text-gray-900">{inv.title || "Tanpa judul"}</p>
                  <p className="text-xs text-gray-500">
                    {themeName ?? "Tema belum dipilih"}
                    {" · "}
                    <span className={inv.status === "published" ? "text-green-600" : "text-gray-400"}>
                      {inv.status === "published" ? "Publik" : "Draft"}
                    </span>
                  </p>
                  <div className="mt-3 flex w-full gap-2">
                    <Link href={`/dashboard/invitations/${inv.id}`} className="btn-primary flex-1 text-center text-sm">
                      ✏️ Edit
                    </Link>
                    <Link href={`/dashboard/invitations/${inv.id}/guests`} className="btn-outline flex-1 text-center text-sm">
                      👥 Tamu
                    </Link>
                  </div>
                  {inv.status === "published" && (
                    <Link href={`/u/${inv.slug}`} target="_blank" className="mt-2 text-xs text-brand-600">
                      Lihat undangan publik ↗
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
