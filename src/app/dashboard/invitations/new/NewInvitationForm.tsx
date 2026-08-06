"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { EVENT_TYPES, slugifyName } from "@/lib/constants";
import type { Package, Theme } from "@/lib/types";

export default function NewInvitationForm({
  packages,
  themes,
}: {
  packages: Package[];
  themes: Theme[];
}) {
  const router = useRouter();
  const [eventType, setEventType] = useState<string>("wedding");
  const [title, setTitle] = useState("");
  const [packageId, setPackageId] = useState(packages[0]?.id ?? "");
  const [themeId, setThemeId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const availableThemes = useMemo(
    () => themes.filter((t) => !packageId || t.package_id === packageId),
    [themes, packageId],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) return setError("Judul undangan wajib diisi.");

    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return setError("Sesi berakhir. Silakan masuk kembali.");
    }

    const slug = `${slugifyName(title)}-${Math.random()
      .toString(36)
      .slice(2, 7)}`;

    const { data, error: insErr } = await supabase
      .from("invitations")
      .insert({
        user_id: user.id,
        event_type: eventType,
        title: title.trim(),
        slug,
        package_id: packageId || null,
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
    <form onSubmit={handleSubmit} className="card max-w-2xl space-y-5 p-6">
      <div>
        <label className="label">Jenis acara</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {EVENT_TYPES.map((e) => (
            <button
              type="button"
              key={e.value}
              onClick={() => setEventType(e.value)}
              className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                eventType === e.value
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Judul undangan</label>
        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="mis. Pernikahan Ayu & Bagas"
          required
        />
      </div>

      <div>
        <label className="label">Paket</label>
        <select
          className="input"
          value={packageId}
          onChange={(e) => {
            setPackageId(e.target.value);
            setThemeId("");
          }}
        >
          {packages.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Tema</label>
        <select
          className="input"
          value={themeId}
          onChange={(e) => setThemeId(e.target.value)}
        >
          <option value="">— Pilih tema —</option>
          {availableThemes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        {availableThemes.length === 0 && (
          <p className="mt-1 text-xs text-gray-400">
            Belum ada tema untuk paket ini.
          </p>
        )}
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Membuat…" : "Buat Draft Undangan"}
      </button>
    </form>
  );
}
