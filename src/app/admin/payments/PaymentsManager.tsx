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

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {o.payment_proof_url ? (
              <a href={o.payment_proof_url} target="_blank" rel="noreferrer" className="btn-outline px-3 py-1.5 text-xs">
                🧾 Lihat Bukti Bayar
              </a>
            ) : (
              <span className="text-xs text-gray-400">Belum ada bukti bayar</span>
            )}
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
    </div>
  );
}
