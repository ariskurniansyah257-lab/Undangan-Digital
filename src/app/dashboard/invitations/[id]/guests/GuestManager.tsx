"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { slugifyName } from "@/lib/constants";
import type { Guest } from "@/lib/types";

export default function GuestManager({
  invitationId,
  slug,
  published,
  maxGuests,
  initialGuests,
}: {
  invitationId: string;
  slug: string;
  published: boolean;
  maxGuests: number;
  initialGuests: Guest[];
}) {
  const supabase = createClient();
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const [name, setName] = useState("");
  const [bulk, setBulk] = useState("");
  const [category, setCategory] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  function linkFor(g: Guest) {
    return `${origin}/u/${slug}?to=${encodeURIComponent(g.name)}`;
  }

  function uniqueSlug(base: string, taken: Set<string>) {
    let s = slugifyName(base) || "tamu";
    let n = s;
    let i = 1;
    while (taken.has(n)) n = `${s}-${i++}`;
    return n;
  }

  async function addNames(names: string[]) {
    const clean = names.map((n) => n.trim()).filter(Boolean);
    if (clean.length === 0) return;
    if (guests.length + clean.length > maxGuests) {
      setMsg(`Melebihi batas ${maxGuests} tamu.`);
      return;
    }
    setBusy(true);
    setMsg(null);
    const taken = new Set(guests.map((g) => g.slug));
    const rows = clean.map((nm) => {
      const s = uniqueSlug(nm, taken);
      taken.add(s);
      return { invitation_id: invitationId, name: nm, slug: s, category: category || null };
    });
    const { data, error } = await supabase.from("guests").insert(rows).select("*");
    setBusy(false);
    if (error) return setMsg(`Gagal: ${error.message}`);
    setGuests([...(data as Guest[]), ...guests]);
    setName("");
    setBulk("");
    setMsg(`${rows.length} tamu ditambahkan ✓`);
  }

  async function remove(g: Guest) {
    setGuests(guests.filter((x) => x.id !== g.id));
    await supabase.from("guests").delete().eq("id", g.id);
  }

  async function copyLink(g: Guest) {
    await navigator.clipboard?.writeText(linkFor(g));
    setCopiedId(g.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <div className="space-y-6">
      {!published && (
        <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Undangan masih draft. Tautan tamu baru bisa dibuka publik setelah undangan
          dipublikasikan di editor.
        </div>
      )}

      {/* Tambah tamu */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900">Tambah Satu Tamu</h2>
          <div className="mt-3 space-y-3">
            <input className="input" placeholder="Nama tamu" value={name} onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addNames([name])} />
            <input className="input" placeholder="Kategori (opsional, mis. Keluarga)" value={category} onChange={(e) => setCategory(e.target.value)} />
            <button onClick={() => addNames([name])} className="btn-primary w-full" disabled={busy}>
              + Tambah &amp; Buat Link
            </button>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-gray-900">Tambah Massal</h2>
          <p className="text-xs text-gray-500">Satu nama per baris.</p>
          <textarea className="input mt-2 min-h-[92px]" placeholder={"Bapak Budi\nIbu Sri\nKeluarga Andi"} value={bulk} onChange={(e) => setBulk(e.target.value)} />
          <button onClick={() => addNames(bulk.split("\n"))} className="btn-outline mt-2 w-full" disabled={busy}>
            + Tambah Semua
          </button>
        </div>
      </div>

      {msg && <p className={`text-sm ${msg.startsWith("Gagal") || msg.includes("Melebihi") ? "text-red-600" : "text-green-600"}`}>{msg}</p>}

      {/* Daftar tamu */}
      <div className="card">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
          <h2 className="font-semibold text-gray-900">Daftar Tamu</h2>
          <span className="text-sm text-gray-500">{guests.length} / {maxGuests}</span>
        </div>
        {guests.length === 0 ? (
          <p className="p-8 text-center text-gray-400">Belum ada tamu.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {guests.map((g) => (
              <li key={g.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">{g.name}</p>
                  <p className="truncate text-xs text-gray-400">{linkFor(g)}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => copyLink(g)} className="btn-outline px-3 py-1.5 text-xs">
                    {copiedId === g.id ? "✓ Tersalin" : "Salin Link"}
                  </button>
                  <a href={linkFor(g)} target="_blank" rel="noreferrer" className="btn-ghost px-3 py-1.5 text-xs">Buka</a>
                  <button onClick={() => remove(g)} className="px-2 text-xs text-red-500">Hapus</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
