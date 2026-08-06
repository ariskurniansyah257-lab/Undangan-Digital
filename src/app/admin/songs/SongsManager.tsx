"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ImageUpload from "@/components/ImageUpload";
import type { Song } from "@/lib/types";

export default function SongsManager({ initial }: { initial: Song[] }) {
  const supabase = createClient();
  const [songs, setSongs] = useState(initial);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [url, setUrl] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function add() {
    if (!title.trim() || !url.trim()) return setMsg("Judul & URL wajib diisi.");
    const { data, error } = await supabase
      .from("songs")
      .insert({ title: title.trim(), artist: artist.trim() || null, url: url.trim() })
      .select("*")
      .single();
    if (error) return setMsg(`Gagal: ${error.message}`);
    setSongs([data as Song, ...songs]);
    setTitle(""); setArtist(""); setUrl(""); setMsg("Ditambahkan ✓");
  }
  async function del(id: string) {
    setSongs(songs.filter((s) => s.id !== id));
    await supabase.from("songs").delete().eq("id", id);
  }
  async function toggle(s: Song) {
    setSongs(songs.map((x) => (x.id === s.id ? { ...x, is_active: !x.is_active } : x)));
    await supabase.from("songs").update({ is_active: !s.is_active }).eq("id", s.id);
  }

  return (
    <div className="space-y-6">
      <div className="card space-y-3 p-5">
        <h2 className="font-semibold text-gray-900">Tambah Lagu</h2>
        <div className="grid gap-2 sm:grid-cols-3">
          <input className="input" placeholder="Judul" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input className="input" placeholder="Artis (opsional)" value={artist} onChange={(e) => setArtist(e.target.value)} />
          <div className="flex gap-2">
            <input className="input" placeholder="URL audio (mp3)" value={url} onChange={(e) => setUrl(e.target.value)} />
            <ImageUpload label="Unggah MP3" accept="audio/*" onUploaded={setUrl} />
          </div>
        </div>
        {url && <p className="truncate text-xs text-green-600">✓ {url}</p>}
        <button onClick={add} className="btn-primary w-fit">+ Tambah</button>
        {msg && <p className="text-sm text-gray-600">{msg}</p>}
      </div>

      <div className="card divide-y divide-gray-100">
        {songs.length === 0 ? (
          <p className="p-8 text-center text-gray-400">Belum ada lagu.</p>
        ) : (
          songs.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-gray-900">{s.title}</p>
                <p className="text-xs text-gray-400">{s.artist ?? "—"} · {s.url}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggle(s)} className={`rounded-full px-2 py-0.5 text-xs ${s.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {s.is_active ? "Aktif" : "Nonaktif"}
                </button>
                <button onClick={() => del(s.id)} className="text-sm text-red-500">Hapus</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
