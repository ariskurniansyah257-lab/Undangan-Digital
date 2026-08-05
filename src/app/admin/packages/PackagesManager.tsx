"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Package, PackageFeature } from "@/lib/types";

export default function PackagesManager({
  packages,
  features: initialFeatures,
}: {
  packages: Package[];
  features: PackageFeature[];
}) {
  const supabase = createClient();
  const [pkgs, setPkgs] = useState(packages);
  const [features, setFeatures] = useState(initialFeatures);
  const [msg, setMsg] = useState<string | null>(null);

  function patchPkg(id: string, patch: Partial<Package>) {
    setPkgs(pkgs.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }
  async function savePkg(p: Package) {
    const { error } = await supabase
      .from("packages")
      .update({
        price: p.price, discount_price: p.discount_price, tagline: p.tagline,
        max_guests: p.max_guests, max_gallery: p.max_gallery, max_events: p.max_events, max_banks: p.max_banks,
        allow_video: p.allow_video, allow_auto_slide: p.allow_auto_slide, allow_motion: p.allow_motion,
      })
      .eq("id", p.id);
    setMsg(error ? `Gagal: ${error.message}` : `Paket ${p.name} tersimpan ✓`);
  }

  async function addFeature(pkgId: string) {
    const { data } = await supabase
      .from("package_features")
      .insert({ package_id: pkgId, label: "Fitur baru", included: true, sort_order: features.filter((f) => f.package_id === pkgId).length })
      .select("*")
      .single();
    if (data) setFeatures([...features, data as PackageFeature]);
  }
  async function patchFeature(id: string, patch: Partial<PackageFeature>) {
    setFeatures(features.map((f) => (f.id === id ? { ...f, ...patch } : f)));
    await supabase.from("package_features").update(patch).eq("id", id);
  }
  async function delFeature(id: string) {
    setFeatures(features.filter((f) => f.id !== id));
    await supabase.from("package_features").delete().eq("id", id);
  }

  const num = (v: string) => (v === "" ? 0 : Number(v));

  return (
    <div className="space-y-5">
      {msg && <p className="text-sm text-green-600">{msg}</p>}
      {pkgs.map((p) => {
        const feats = features.filter((f) => f.package_id === p.id);
        return (
          <div key={p.id} className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{p.name}</h2>
              <button onClick={() => savePkg(p)} className="btn-primary px-4 py-1.5 text-sm">Simpan Paket</button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <label className="text-sm">Harga
                <input className="input mt-1" type="number" value={p.price} onChange={(e) => patchPkg(p.id, { price: num(e.target.value) })} />
              </label>
              <label className="text-sm">Harga diskon
                <input className="input mt-1" type="number" value={p.discount_price ?? ""} onChange={(e) => patchPkg(p.id, { discount_price: e.target.value ? num(e.target.value) : null })} />
              </label>
              <label className="text-sm">Tagline
                <input className="input mt-1" value={p.tagline ?? ""} onChange={(e) => patchPkg(p.id, { tagline: e.target.value })} />
              </label>
              <label className="text-sm">Max tamu
                <input className="input mt-1" type="number" value={p.max_guests} onChange={(e) => patchPkg(p.id, { max_guests: num(e.target.value) })} />
              </label>
              <label className="text-sm">Max galeri
                <input className="input mt-1" type="number" value={p.max_gallery} onChange={(e) => patchPkg(p.id, { max_gallery: num(e.target.value) })} />
              </label>
              <label className="text-sm">Max acara
                <input className="input mt-1" type="number" value={p.max_events} onChange={(e) => patchPkg(p.id, { max_events: num(e.target.value) })} />
              </label>
              <label className="text-sm">Max bank
                <input className="input mt-1" type="number" value={p.max_banks} onChange={(e) => patchPkg(p.id, { max_banks: num(e.target.value) })} />
              </label>
            </div>

            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              {([["allow_video", "Video"], ["allow_auto_slide", "Galeri geser"], ["allow_motion", "Motion"]] as const).map(([k, lbl]) => (
                <label key={k} className="flex items-center gap-2">
                  <input type="checkbox" checked={(p as any)[k]} onChange={(e) => patchPkg(p.id, { [k]: e.target.checked } as any)} />
                  {lbl}
                </label>
              ))}
            </div>

            {/* Komparasi */}
            <div className="mt-5 border-t border-gray-100 pt-4">
              <p className="mb-2 text-sm font-medium text-gray-700">Baris komparasi (tampil di home)</p>
              <div className="space-y-2">
                {feats.map((f) => (
                  <div key={f.id} className="flex flex-wrap items-center gap-2">
                    <input className="input flex-1" value={f.label} onChange={(e) => patchFeature(f.id, { label: e.target.value })} placeholder="Label" />
                    <input className="input w-32" value={f.value ?? ""} onChange={(e) => patchFeature(f.id, { value: e.target.value })} placeholder="Nilai" />
                    <label className="flex items-center gap-1 text-xs">
                      <input type="checkbox" checked={f.included} onChange={(e) => patchFeature(f.id, { included: e.target.checked })} /> termasuk
                    </label>
                    <button onClick={() => delFeature(f.id)} className="text-xs text-red-500">Hapus</button>
                  </div>
                ))}
              </div>
              <button onClick={() => addFeature(p.id)} className="btn-outline mt-2 px-3 py-1.5 text-xs">+ Tambah baris</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
