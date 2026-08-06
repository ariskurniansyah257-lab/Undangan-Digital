"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SiteHeaderClient from "@/components/SiteHeaderClient";
import { createClient } from "@/lib/supabase/client";
import { getCart, removeFromCart, cartTotal, clearCart, type CartItem } from "@/lib/cart";
import { formatIDR } from "@/lib/constants";

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setItems(getCart());
    update();
    window.addEventListener("cart-updated", update);
    return () => window.removeEventListener("cart-updated", update);
  }, []);

  const total = cartTotal(items);

  async function checkout() {
    setError(null);
    if (items.length === 0) return;
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login?redirect=/cart");
      return;
    }

    const { data: order, error: oErr } = await supabase
      .from("orders")
      .insert({ user_id: user.id, total, status: "menunggu" })
      .select("id")
      .single();
    if (oErr || !order) {
      setLoading(false);
      return setError(oErr?.message ?? "Gagal membuat pesanan.");
    }

    // Untuk item paket, refId = slug paket → petakan ke package_id agar
    // pembelian paket tercatat (dipakai untuk kuota 1 paket = 1 undangan).
    const pkgSlugs = items.filter((i) => i.type === "package").map((i) => i.refId);
    let slugToId: Record<string, string> = {};
    if (pkgSlugs.length) {
      const { data: pkgs } = await supabase
        .from("packages")
        .select("id, slug")
        .in("slug", pkgSlugs);
      slugToId = Object.fromEntries((pkgs ?? []).map((p) => [p.slug, p.id]));
    }

    const rows = items.map((i) => ({
      order_id: order.id,
      product_id: i.type === "product" ? i.refId : null,
      package_id: i.type === "package" ? slugToId[i.refId] ?? null : null,
      theme_id: i.themeId ?? null,
      name: i.name,
      price: i.price,
      qty: i.qty,
    }));
    await supabase.from("order_items").insert(rows);

    clearCart();
    router.push(`/dashboard/orders/${order.id}`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeaderClient />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900">Keranjang</h1>

        {items.length === 0 ? (
          <div className="card mt-6 p-10 text-center text-gray-500">
            Keranjang kosong.
            <div className="mt-4">
              <Link href="/#paket" className="btn-primary">Lihat Paket</Link>
            </div>
          </div>
        ) : (
          <>
            <div className="card mt-6 divide-y divide-gray-100">
              {items.map((i) => (
                <div key={i.key} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium text-gray-900">{i.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatIDR(i.price)} × {i.qty}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">{formatIDR(i.price * i.qty)}</span>
                    <button onClick={() => removeFromCart(i.key)} className="text-sm text-red-500">Hapus</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="card mt-4 flex items-center justify-between p-5">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-xl font-bold text-brand-600">{formatIDR(total)}</span>
            </div>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

            <button onClick={checkout} className="btn-primary mt-4 w-full py-3 text-base" disabled={loading}>
              {loading ? "Memproses…" : "Checkout & Bayar"}
            </button>
            <p className="mt-2 text-center text-xs text-gray-400">
              Anda perlu masuk untuk menyelesaikan pesanan.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
