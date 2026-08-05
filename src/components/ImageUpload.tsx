"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/** Tombol upload gambar ke bucket 'invitations', mengembalikan URL publik. */
export default function ImageUpload({
  onUploaded,
  label = "Upload",
  accept = "image/*",
}: {
  onUploaded: (url: string) => void;
  label?: string;
  accept?: string;
}) {
  const ref = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setErr(null);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setErr("Sesi berakhir, silakan masuk lagi.");
        return;
      }
      const safe = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
      const path = `${user.id}/${Date.now()}-${safe}`;
      const { error } = await supabase.storage
        .from("invitations")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (error) {
        // Pesan spesifik agar mudah didiagnosis.
        const msg = /bucket/i.test(error.message)
          ? "Bucket 'invitations' belum ada di Supabase Storage. Jalankan migrasi storage."
          : /row-level security|policy/i.test(error.message)
            ? "Ditolak oleh kebijakan Storage. Aktifkan policy upload (lihat panduan)."
            : error.message;
        setErr(msg);
        return;
      }
      const { data } = supabase.storage.from("invitations").getPublicUrl(path);
      onUploaded(data.publicUrl);
    } catch (e: any) {
      setErr(e?.message ?? "Gagal mengunggah.");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  }

  return (
    <span className="inline-flex flex-col items-start">
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="btn-outline shrink-0 px-3 py-2 text-xs"
        disabled={busy}
      >
        {busy ? "Mengunggah…" : `📤 ${label}`}
      </button>
      {err && <span className="mt-1 max-w-[220px] text-[11px] text-red-600">{err}</span>}
      <input ref={ref} type="file" accept={accept} onChange={handle} className="hidden" />
    </span>
  );
}
