"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { uploadImage } from "@/lib/upload";

/**
 * Kolom foto tanpa menampilkan URL. Menyediakan tombol unggah + "Lihat foto"
 * (buka pratinjau) + hapus. Menggantikan input URL agar klien/admin cukup
 * mengunggah dan melihat hasilnya.
 */
export default function ImageField({
  value,
  onChange,
  label = "foto",
  accept = "image/*",
  bucket = "invitations",
}: {
  value: string | null | undefined;
  onChange: (url: string) => void;
  label?: string;
  accept?: string;
  bucket?: string;
}) {
  const ref = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [view, setView] = useState(false);

  async function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setErr(null);
    try {
      const supabase = createClient();
      const { url } = await uploadImage(supabase, file, bucket);
      onChange(url);
    } catch (e: any) {
      setErr(e?.message ?? "Gagal mengunggah.");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="btn-outline shrink-0 px-3 py-2 text-xs"
        disabled={busy}
      >
        {busy ? "Mengunggah…" : value ? `📤 Ganti ${label}` : `📤 Unggah ${label}`}
      </button>
      {value && (
        <>
          <button
            type="button"
            onClick={() => setView(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="h-6 w-6 rounded object-cover" />
            👁️ Lihat {label}
          </button>
          <button type="button" onClick={() => onChange("")} className="text-xs text-red-500">
            Hapus
          </button>
        </>
      )}
      {err && <span className="w-full text-[11px] text-red-600">{err}</span>}
      <input ref={ref} type="file" accept={accept} onChange={handle} className="hidden" />

      {view && value && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setView(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={label} className="max-h-[85vh] max-w-full rounded-lg shadow-2xl" />
          <button
            type="button"
            onClick={() => setView(false)}
            className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-sm font-medium"
          >
            ✕ Tutup
          </button>
        </div>
      )}
    </div>
  );
}
