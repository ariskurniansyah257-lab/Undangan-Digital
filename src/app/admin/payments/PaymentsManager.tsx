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

export default function PaymentsManager({ initial }: { initial: OrderRow[] }) {
  const supabase = createClient();
  const [orders, setOrders] = useState(initial);
  const [zoom, setZoom] = useState<string | null>(null);

  async function setStatus(o: OrderRow, status: OrderStatus) {
    setOrders(orders.map((x) => (x.id === o.id ? { ...x, status } : x)));
    await supabase
      .from("orders")
      .update({ status, paid_at: status === "berhasil" ? new Date().toISOString() : null })
      .eq("id", o.id);
  }

  if (orders.length === 0)
    return <div className="card p-10 text-center text-gray-400">Belum ada pesanan.</div>;

  return (
    <div className="space-y-4">
      {orders.map((o) => (
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
      ))}

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
