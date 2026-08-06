"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { uploadImage } from "@/lib/upload";

/** Tombol upload gambar (Storage bila aktif, atau fallback data URI). */
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
      const { url } = await uploadImage(supabase, file);
      onUploaded(url);
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
