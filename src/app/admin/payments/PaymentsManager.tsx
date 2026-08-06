"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatIDR, ORDER_STATUS, type OrderStatus } from "@/lib/constants";

type OrderRow = {
  id: string;
  invoice_no: string;
  status: OrderStatus;
  total: number;
  payment_proof_url: string | null;
  created_at: string;
  order_items?: { name: string; qty: number; price: number }[];
  profiles?: { full_name: string; email: string } | null;
};

const NEXT: Record<string, OrderStatus[]> = {
  menunggu: ["diproses", "ditolak"],
  diproses: ["berhasil", "ditolak"],
  berhasil: [],
  ditolak: ["diproses"],
};

const STATUS_FILTERS: { value: "semua" | OrderStatus; label: string }[] = [
  { value: "semua", label: "Semua" },
  { value: "menunggu", label: "Menunggu" },
  { value: "diproses", label: "Diproses" },
  { value: "berhasil", label: "Berhasil" },
  { value: "ditolak", label: "Ditolak" },
];

export default function PaymentsManager({ initial }: { initial: OrderRow[] }) {
  const supabase = createClient();
  const [orders, setOrders] = useState(initial);
  const [zoom, setZoom] = useState<string | null>(null);
  const [filter, setFilter] = useState<"semua" | OrderStatus>("semua");
  const [q, setQ] = useState("");

  async function setStatus(o: OrderRow, status: OrderStatus) {
    setOrders(orders.map((x) => (x.id === o.id ? { ...x, status } : x)));
    await supabase
      .from("orders")
      .update({ status, paid_at: status === "berhasil" ? new Date().toISOString() : null })
      .eq("id", o.id);
  }

  const term = q.trim().toLowerCase();
  const visible = orders.filter((o) => {
    if (filter !== "semua" && o.status !== filter) return false;
    if (!term) return true;
    const hay = [
      o.invoice_no,
      o.profiles?.full_name,
      o.profiles?.email,
      ...(o.order_items ?? []).map((i) => i.name),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return hay.includes(term);
  });

  const countByStatus = (s: "semua" | OrderStatus) =>
    s === "semua" ? orders.length : orders.filter((o) => o.status === s).length;

  return (
    <div className="space-y-4">
      {/* Filter jenis transaksi + pencarian */}
      <div className="card space-y-3 p-4">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f.value
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-gray-300 bg-white text-gray-600 hover:border-brand-300"
              }`}
            >
              {f.label}
              <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] ${filter === f.value ? "bg-white/25" : "bg-gray-100"}`}>
                {countByStatus(f.value)}
              </span>
            </button>
          ))}
        </div>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            className="input pl-9"
            placeholder="Cari invoice, nama, email, atau produk…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="card p-10 text-center text-gray-400">Belum ada pesanan.</div>
      ) : visible.length === 0 ? (
        <div className="card p-10 text-center text-gray-400">Tidak ada transaksi yang cocok.</div>
      ) : (
        visible.map((o) => (
        <div key={o.id} className="card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-gray-900">{o.invoice_no}</p>
              <p className="text-sm text-gray-500">
                {o.profiles?.full_name} · {o.profiles?.email}
              </p>
              <p className="mt-1 text-sm text-gray-600">
                {(o.order_items ?? []).map((i) => `${i.name} ×${i.qty}`).join(", ")}
              </p>
              <p className="mt-1 font-medium text-brand-600">{formatIDR(o.total)}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${
              o.status === "berhasil" ? "bg-green-100 text-green-700"
              : o.status === "ditolak" ? "bg-red-100 text-red-700"
              : o.status === "diproses" ? "bg-blue-100 text-blue-700"
              : "bg-amber-100 text-amber-700"}`}>
              {ORDER_STATUS[o.status].label}
            </span>
          </div>

          {/* Bukti bayar: tampil inline (thumbnail) + klik untuk perbesar.
              Tidak memakai link agar bukti berformat data-URI tetap terlihat. */}
          {o.payment_proof_url ? (
            <div className="mt-3">
              <p className="mb-1 text-xs font-medium text-gray-600">Bukti bayar:</p>
              <button type="button" onClick={() => setZoom(o.payment_proof_url)} className="block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={o.payment_proof_url}
                  alt="Bukti bayar"
                  className="h-40 w-auto max-w-full rounded-lg border object-contain"
                />
                <span className="mt-1 block text-[11px] text-brand-600">🔍 Klik untuk perbesar</span>
              </button>
            </div>
          ) : (
            <p className="mt-3 text-xs text-gray-400">Belum ada bukti bayar</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {NEXT[o.status]?.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(o, s)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium text-white ${
                  s === "berhasil" ? "bg-green-600" : s === "ditolak" ? "bg-red-600" : "bg-blue-600"
                }`}
              >
                Tandai {ORDER_STATUS[s].label}
              </button>
            ))}
          </div>
        </div>
        ))
      )}

      {zoom && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setZoom(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={zoom} alt="Bukti bayar" className="max-h-[90vh] max-w-full rounded-lg shadow-2xl" />
          <button
            type="button"
            onClick={() => setZoom(null)}
            className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-sm font-medium"
          >
            ✕ Tutup
          </button>
        </div>
      )}
    </div>
  );
}
