"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatIDR } from "@/lib/constants";
import ImageUpload from "@/components/ImageUpload";
import type { Product, Package } from "@/lib/types";

export default function ProductsManager({ initial, packages }: { initial: Product[]; packages: Package[] }) {
  const supabase = createClient();
  const [items, setItems] = useState(initial);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [packageId, setPackageId] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const pkgName = (id: string | null) => packages.find((p) => p.id === id)?.name ?? null;

  async function add() {
    if (!name.trim()) return setMsg("Nama wajib.");
    const { data, error } = await supabase
      .from("products")
      .insert({
        name: name.trim(),
        price: Number(price) || 0,
        image: image.trim() || null,
        description: description.trim() || null,
        package_id: packageId || null,
      })
      .select("*")
      .single();
    if (error) return setMsg(`Gagal: ${error.message}`);
    setItems([data as Product, ...items]);
    setName(""); setPrice(""); setImage(""); setDescription(""); setPackageId(""); setMsg("Ditambahkan ✓");
  }
  async function del(id: string) {
    setItems(items.filter((p) => p.id !== id));
    await supabase.from("products").delete().eq("id", id);
  }
  async function setProductPackage(id: string, pkg: string) {
    setItems(items.map((p) => (p.id === id ? { ...p, package_id: pkg || null } : p)));
    await supabase.from("products").update({ package_id: pkg || null }).eq("id", id);
  }

  return (
    <div className="space-y-6">
      <div className="card space-y-3 p-5">
        <h2 className="font-semibold text-gray-900">Tambah Produk</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          <input className="input" placeholder="Nama produk" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="input" placeholder="Harga (angka)" value={price} onChange={(e) => setPrice(e.target.value)} />
          <div className="flex gap-2">
            <input className="input" placeholder="URL gambar" value={image} onChange={(e) => setImage(e.target.value)} />
            <ImageUpload onUploaded={setImage} />
          </div>
          <select className="input" value={packageId} onChange={(e) => setPackageId(e.target.value)}>
            <option value="">— Tanpa paket (umum) —</option>
            {packages.map((p) => (
              <option key={p.id} value={p.id}>Paket {p.name}</option>
            ))}
          </select>
          <input className="input sm:col-span-2" placeholder="Deskripsi" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <button onClick={add} className="btn-primary w-fit">+ Tambah</button>
        {msg && <p className="text-sm text-gray-600">{msg}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <div key={p.id} className="card overflow-hidden">
            {p.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.image} alt={p.name} className="h-36 w-full object-cover" />
            ) : (
              <div className="flex h-36 items-center justify-center bg-gray-100 text-gray-300">Tanpa gambar</div>
            )}
            <div className="p-4">
              <p className="font-medium text-gray-900">{p.name}</p>
              <p className="text-sm text-brand-600">{formatIDR(p.price)}</p>
              {pkgName(p.package_id) && (
                <span className="mt-1 inline-block rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-600">
                  Paket {pkgName(p.package_id)}
                </span>
              )}
              <select
                className="input mt-2 py-1.5 text-xs"
                value={p.package_id ?? ""}
                onChange={(e) => setProductPackage(p.id, e.target.value)}
              >
                <option value="">— Tanpa paket (umum) —</option>
                {packages.map((pk) => (
                  <option key={pk.id} value={pk.id}>Paket {pk.name}</option>
                ))}
              </select>
              <button onClick={() => del(p.id)} className="mt-2 text-xs text-red-500">Hapus</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-gray-400">Belum ada produk.</p>}
      </div>
    </div>
  );
}
