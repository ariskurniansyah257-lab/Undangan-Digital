"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { slugifyName } from "@/lib/constants";
import {
  resolveTheme,
  ANIMATIONS,
  type OrnamentType,
  type AnimationType,
  type ThemeVars,
} from "@/lib/themes";
import ImageField from "@/components/ImageField";
import PhoneMockup from "@/components/landing/PhoneMockup";
import type { Theme, Package } from "@/lib/types";

const ORNAMENTS: OrnamentType[] = ["jawa", "padang", "ceria", "modern", "artistik"];

const VAR_FIELDS: { key: keyof ThemeVars; label: string }[] = [
  { key: "coverFrom", label: "Cover (atas)" },
  { key: "coverTo", label: "Cover (bawah)" },
  { key: "accent", label: "Aksen" },
  { key: "heading", label: "Judul" },
  { key: "tint", label: "Latar lembut" },
  { key: "body", label: "Latar isi" },
];

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
  function patchTheme(id: string, patch: Partial<Theme>) {
    setThemes((ts) => ts.map((t) => (t.id === id ? { ...t, ...patch } : t)));
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
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Preview:</span>
            <ImageField value={preview} onChange={setPreview} label="preview" />
          </div>
        </div>
        <button onClick={add} className="btn-primary w-fit">+ Tambah</button>
        {msg && <p className="text-sm text-gray-600">{msg}</p>}
      </div>

      <div className="space-y-4">
        {themes.map((t) => (
          <ThemeCard key={t.id} theme={t} pkgLabel={pkgName(t.package_id)} onPatch={patchTheme} onDelete={del} />
        ))}
        {themes.length === 0 && <p className="text-gray-400">Belum ada tema.</p>}
      </div>
    </div>
  );
}

function ThemeCard({
  theme,
  pkgLabel,
  onPatch,
  onDelete,
}: {
  theme: Theme;
  pkgLabel: string;
  onPatch: (id: string, patch: Partial<Theme>) => void;
  onDelete: (id: string) => void;
}) {
  const supabase = createClient();
  const eff = resolveTheme(theme.slug, theme.config);
  const [open, setOpen] = useState(false);
  const [vars, setVars] = useState<ThemeVars>(eff.vars);
  const [ornament, setOrnament] = useState<OrnamentType>(eff.ornament);
  const [animation, setAnimation] = useState<AnimationType>(eff.animation);
  const [coverImage, setCoverImage] = useState<string>(eff.coverImage ?? "");
  const [ornamentImage, setOrnamentImage] = useState<string>(eff.ornamentImage ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    const config = {
      vars,
      ornament,
      ornamentImage: ornamentImage || null,
      animation,
      coverImage: coverImage || null,
    };
    const { error } = await supabase.from("themes").update({ config }).eq("id", theme.id);
    setSaving(false);
    if (!error) {
      onPatch(theme.id, { config });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-4 p-4">
        <div className="shrink-0">
          <PhoneMockup compact from={vars.coverFrom} to={vars.coverTo} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-gray-900">{theme.name}</p>
          <p className="truncate text-xs text-gray-400">/{theme.slug}</p>
          <span className="mt-1 inline-block rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-600">{pkgLabel}</span>
          <div className="mt-2 flex gap-3 text-xs">
            <a href={`/preview/${theme.slug}`} target="_blank" rel="noreferrer" className="text-brand-600 underline">👁️ Preview</a>
            <button onClick={() => setOpen((v) => !v)} className="text-gray-600 underline">
              {open ? "Tutup editor" : "✏️ Edit tampilan & animasi"}
            </button>
            <button onClick={() => onDelete(theme.id)} className="text-red-500">Hapus</button>
          </div>
        </div>
      </div>

      {open && (
        <div className="space-y-4 border-t border-gray-100 bg-gray-50/60 p-4">
          {/* Warna cover / isi / background */}
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">Warna (cover, isi, background)</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {VAR_FIELDS.map((f) => (
                <label key={f.key} className="flex items-center gap-2 text-xs text-gray-600">
                  <input
                    type="color"
                    value={vars[f.key]}
                    onChange={(e) => setVars({ ...vars, [f.key]: e.target.value })}
                    className="h-8 w-10 rounded border border-gray-300"
                  />
                  {f.label}
                </label>
              ))}
            </div>
          </div>

          {/* Ornamen + animasi */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Ornamen latar (motif bawaan)</label>
              <select className="input" value={ornament} onChange={(e) => setOrnament(e.target.value as OrnamentType)}>
                {ORNAMENTS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Animasi transisi (seperti PowerPoint)</label>
              <select className="input" value={animation} onChange={(e) => setAnimation(e.target.value as AnimationType)}>
                {ANIMATIONS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </div>
          </div>

          {/* Ornamen kustom (unggah sendiri) */}
          <div>
            <label className="label">Ornamen kustom (unggah gambar, opsional)</label>
            <p className="mb-1.5 text-xs text-gray-500">
              Bila diunggah, motif ini menggantikan ornamen bawaan sebagai latar berulang.
            </p>
            <ImageField value={ornamentImage} onChange={setOrnamentImage} label="ornamen" />
          </div>

          {/* Gambar cover */}
          <div>
            <label className="label">Gambar cover (opsional)</label>
            <ImageField value={coverImage} onChange={setCoverImage} label="cover" />
          </div>

          <div className="flex items-center gap-3">
            <button onClick={save} className="btn-primary" disabled={saving}>
              {saving ? "Menyimpan…" : "Simpan Tema"}
            </button>
            {saved && <span className="text-sm text-green-600">Tersimpan ✓</span>}
          </div>
        </div>
      )}
    </div>
  );
}
