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

  async function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const safe = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const path = `${user?.id ?? "anon"}/${Date.now()}-${safe}`;
    const { error } = await supabase.storage.from("invitations").upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("invitations").getPublicUrl(path);
      onUploaded(data.publicUrl);
    }
    setBusy(false);
    if (ref.current) ref.current.value = "";
  }

  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="btn-outline shrink-0 px-3 py-2 text-xs"
        disabled={busy}
      >
        {busy ? "…" : `📤 ${label}`}
      </button>
      <input ref={ref} type="file" accept={accept} onChange={handle} className="hidden" />
    </>
  );
}
