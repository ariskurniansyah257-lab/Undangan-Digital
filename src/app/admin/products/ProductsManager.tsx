"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatIDR } from "@/lib/constants";
import type { Product } from "@/lib/types";

export default function ProductsManager({ initial }: { initial: Product[] }) {
  const supabase = createClient();
  const [items, setItems] = useState(initial);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function add() {
    if (!name.trim()) return setMsg("Nama wajib.");
    const { data, error } = await supabase
      .from("products")
      .insert({
        name: name.trim(),
        price: Number(price) || 0,
        image: image.trim() || null,
        description: description.trim() || null,
      })
      .select("*")
      .single();
    if (error) return setMsg(`Gagal: ${error.message}`);
    setItems([data as Product, ...items]);
    setName(""); setPrice(""); setImage(""); setDescription(""); setMsg("Ditambahkan ✓");
  }
  async function del(id: string) {
    setItems(items.filter((p) => p.id !== id));
    await supabase.from("products").delete().eq("id", id);
  }

  return (
    <div className="space-y-6">
      <div className="card space-y-3 p-5">
        <h2 className="font-semibold text-gray-900">Tambah Produk</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          <input className="input" placeholder="Nama produk" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="input" placeholder="Harga (angka)" value={price} onChange={(e) => setPrice(e.target.value)} />
          <input className="input" placeholder="URL gambar" value={image} onChange={(e) => setImage(e.target.value)} />
          <input className="input" placeholder="Deskripsi" value={description} onChange={(e) => setDescription(e.target.value)} />
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
              <button onClick={() => del(p.id)} className="mt-2 text-xs text-red-500">Hapus</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-gray-400">Belum ada produk.</p>}
      </div>
    </div>
  );
}
