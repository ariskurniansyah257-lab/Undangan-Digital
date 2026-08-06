"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { slugifyName, formatIDR } from "@/lib/constants";
import { getTheme } from "@/lib/themes";
import PhoneMockup from "@/components/landing/PhoneMockup";
import AddToCartButton from "@/components/AddToCartButton";
import type { Package, Theme } from "@/lib/types";

export default function NewInvitationForm({
  packages,
  themes,
  remaining,
  gateActive,
}: {
  packages: Package[];
  themes: Theme[];
  remaining: Record<string, number>;
  gateActive: boolean;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [activePkg, setActivePkg] = useState(packages[0]?.id ?? "");
  const [themeId, setThemeId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pkgPrice = (p: Package) => p.discount_price ?? p.price;
  // Sisa kuota paket (bila gate mati, anggap tak terbatas).
  const quotaOf = (pkgId: string) => (gateActive ? remaining[pkgId] ?? 0 : Infinity);
  const activePkgObj = packages.find((p) => p.id === activePkg) ?? null;
  const activeQuota = quotaOf(activePkg);
  const totalRemaining = gateActive
    ? packages.reduce((s, p) => s + Math.max(0, remaining[p.id] ?? 0), 0)
    : Infinity;

  // Tema paket yang sedang dipilih.
  const pkgThemes = useMemo(
    () => themes.filter((t) => t.package_id === activePkg),
    [themes, activePkg],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) return setError("Judul undangan wajib diisi.");
    if (gateActive && activeQuota <= 0)
      return setError("Anda belum memiliki paket ini. Pesan paket dulu untuk membuat undangan.");
    if (!themeId) return setError("Silakan pilih tema terlebih dahulu.");

    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return setError("Sesi berakhir. Silakan masuk kembali.");
    }

    const slug = `${slugifyName(title)}-${Math.random().toString(36).slice(2, 7)}`;

    const { data, error: insErr } = await supabase
      .from("invitations")
      .insert({
        user_id: user.id,
        event_type: "wedding",
        title: title.trim(),
        slug,
        package_id: activePkg || null,
        theme_id: themeId || null,
      })
      .select("id")
      .single();

    if (insErr) {
      setLoading(false);
      return setError(insErr.message);
    }

    router.push(`/dashboard/invitations/${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card max-w-2xl p-6">
        <label className="label">Judul undangan</label>
        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="mis. Pernikahan Ayu & Bagas"
          required
        />
      </div>

      {/* KATALOG PAKET + TEMA (mirip halaman awal) */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900">Pilih Paket & Tema</h2>
        <p className="mt-0.5 text-sm text-gray-500">
          Geser tab paket, lalu pilih salah satu tema di bawahnya.
        </p>

        {/* Peringatan bila belum punya paket sama sekali */}
        {gateActive && totalRemaining <= 0 && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Anda belum memiliki paket aktif. Pesan paket dulu (seperti membeli produk) untuk
            membuat undangan. Setiap paket berlaku untuk 1 undangan.
          </div>
        )}

        {/* Tab paket — bisa digeser */}
        <div className="-mx-2 mt-4 flex gap-2 overflow-x-auto px-2 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {packages.map((p) => {
            const count = themes.filter((t) => t.package_id === p.id).length;
            const q = quotaOf(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setActivePkg(p.id);
                  setThemeId("");
                }}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  activePkg === p.id
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-gray-300 bg-white text-gray-600 hover:border-brand-300"
                }`}
              >
                {p.name}
                {gateActive ? (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                      q > 0
                        ? activePkg === p.id
                          ? "bg-white/25"
                          : "bg-green-100 text-green-700"
                        : activePkg === p.id
                          ? "bg-white/25"
                          : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {q > 0 ? `${q} tersedia` : "belum dibeli"}
                  </span>
                ) : (
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${activePkg === p.id ? "bg-white/20" : "bg-gray-100"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Info paket aktif */}
        {activePkgObj && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-gray-500">
              Paket <b className="text-gray-800">{activePkgObj.name}</b> · mulai{" "}
              <span className="font-semibold text-brand-600">{formatIDR(pkgPrice(activePkgObj))}</span>
              {activePkgObj.tagline ? ` · ${activePkgObj.tagline}` : ""}
            </p>
            {gateActive && activeQuota <= 0 && (
              <AddToCartButton
                item={{ type: "package", refId: activePkgObj.slug, name: `Paket ${activePkgObj.name}`, price: pkgPrice(activePkgObj) }}
                goToCart
                label={`Pesan Paket ${activePkgObj.name}`}
                className="btn-primary px-4 py-1.5 text-xs"
              />
            )}
          </div>
        )}

        {/* Kartu tema */}
        {gateActive && activeQuota <= 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
            Anda belum membeli paket <b>{activePkgObj?.name}</b>. Pesan paket ini untuk memilih
            temanya dan membuat undangan.
          </div>
        ) : pkgThemes.length === 0 ? (
          <p className="mt-6 text-sm text-gray-400">Belum ada tema untuk paket ini.</p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {pkgThemes.map((t) => {
              const style = getTheme(t.slug);
              const selected = themeId === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setThemeId(t.id)}
                  className={`flex flex-col items-center rounded-xl border-2 p-2 transition-all ${
                    selected ? "border-brand-500 bg-brand-50" : "border-transparent hover:bg-gray-50"
                  }`}
                >
                  <PhoneMockup compact from={style.vars.coverFrom} to={style.vars.coverTo} />
                  <span className="mt-2 text-center text-sm font-medium text-gray-900">{t.name}</span>
                  <span className="mt-1 flex items-center gap-2 text-[11px]">
                    <Link
                      href={`/preview/${t.slug}`}
                      target="_blank"
                      onClick={(e) => e.stopPropagation()}
                      className="text-brand-600 underline"
                    >
                      👁️ Preview
                    </Link>
                    {selected && <span className="font-semibold text-brand-600">✓ Dipilih</span>}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {error && (
        <p className="max-w-2xl rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <button
        type="submit"
        className="btn-primary"
        disabled={loading || (gateActive && activeQuota <= 0)}
      >
        {loading ? "Membuat…" : "Buat Draft Undangan"}
      </button>
    </form>
  );
}
