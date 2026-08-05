"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { slugifyName } from "@/lib/constants";
import ImageUpload from "@/components/ImageUpload";
import type { Theme, Package } from "@/lib/types";

export default function ThemesManager({ initial, packages }: { initial: Theme[]; packages: Package[] }) {
  const supabase = createClient();
  const [themes, setThemes] = useState(initial);
  const [name, setName] = useState("");
  const [packageId, setPackageId] = useState(packages[0]?.id ?? "");
  const [description, setDescription] = useState("");
  const [preview, setPreview] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const pkgName = (id: string | null) => packages.find((p) => p.id === id)?.name ?? "—";

  async function add() {
    if (!name.trim()) return setMsg("Nama wajib.");
    const slug = `${slugifyName(name)}-${Math.random().toString(36).slice(2, 6)}`;
    const { data, error } = await supabase
      .from("themes")
      .insert({ name: name.trim(), slug, package_id: packageId || null, description: description.trim() || null, preview_image: preview || null })
      .select("*")
      .single();
    if (error) return setMsg(`Gagal: ${error.message}`);
    setThemes([...themes, data as Theme]);
    setName(""); setDescription(""); setPreview(""); setMsg("Ditambahkan ✓");
  }
  async function del(id: string) {
    setThemes(themes.filter((t) => t.id !== id));
    await supabase.from("themes").delete().eq("id", id);
  }

  return (
    <div className="space-y-6">
      <div className="card space-y-3 p-5">
        <h2 className="font-semibold text-gray-900">Tambah Tema</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          <input className="input" placeholder="Nama tema" value={name} onChange={(e) => setName(e.target.value)} />
          <select className="input" value={packageId} onChange={(e) => setPackageId(e.target.value)}>
            {packages.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input className="input" placeholder="Deskripsi" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="flex gap-2">
            <input className="input" placeholder="URL preview" value={preview} onChange={(e) => setPreview(e.target.value)} />
            <ImageUpload onUploaded={setPreview} />
          </div>
        </div>
        <button onClick={add} className="btn-primary w-fit">+ Tambah</button>
        {msg && <p className="text-sm text-gray-600">{msg}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {themes.map((t) => (
          <div key={t.id} className="card overflow-hidden">
            {t.preview_image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={t.preview_image} alt={t.name} className="h-36 w-full object-cover" />
            ) : (
              <div className="flex h-36 items-center justify-center bg-gray-100 text-gray-300">Tanpa preview</div>
            )}
            <div className="p-4">
              <p className="font-medium text-gray-900">{t.name}</p>
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-600">{pkgName(t.package_id)}</span>
              <button onClick={() => del(t.id)} className="mt-2 block text-xs text-red-500">Hapus</button>
            </div>
          </div>
        ))}
        {themes.length === 0 && <p className="text-gray-400">Belum ada tema.</p>}
      </div>
    </div>
  );
}
