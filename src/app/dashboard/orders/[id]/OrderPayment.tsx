"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { uploadImage } from "@/lib/upload";
import { formatIDR, ORDER_STATUS, type OrderStatus } from "@/lib/constants";
import type { BankAdmin } from "@/lib/types";

type OrderRow = {
  id: string;
  invoice_no: string;
  status: OrderStatus;
  total: number;
  payment_proof_url: string | null;
  order_items?: { name: string; qty: number; price: number }[];
};

export default function OrderPayment({
  order,
  banks,
  qrisImage,
}: {
  order: OrderRow;
  banks: BankAdmin[];
  qrisImage?: string | null;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [proofUrl, setProofUrl] = useState(order.payment_proof_url);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [qrisZoom, setQrisZoom] = useState(false);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMsg(null);
    let url: string;
    try {
      const res = await uploadImage(supabase, file, "payments");
      url = res.url;
    } catch (err: any) {
      setUploading(false);
      return setMsg(`Gagal unggah: ${err?.message ?? "coba lagi"}`);
    }
    await supabase
      .from("orders")
      .update({ payment_proof_url: url, status: "diproses" })
      .eq("id", order.id);
    setProofUrl(url);
    setStatus("diproses");
    setUploading(false);
    setMsg("Bukti bayar terunggah. Menunggu verifikasi admin.");
    router.refresh();
  }

  const badge =
    status === "berhasil" ? "bg-green-100 text-green-700"
    : status === "ditolak" ? "bg-red-100 text-red-700"
    : status === "diproses" ? "bg-blue-100 text-blue-700"
    : "bg-amber-100 text-amber-700";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{order.invoice_no}</h1>
          <p className="text-gray-500">Detail pesanan & pembayaran</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-medium ${badge}`}>
          {ORDER_STATUS[status].label}
        </span>
      </div>

      {/* Ringkasan */}
      <div className="card divide-y divide-gray-100">
        {(order.order_items ?? []).map((i, idx) => (
          <div key={idx} className="flex items-center justify-between p-4">
            <span className="text-gray-700">{i.name} ×{i.qty}</span>
            <span className="font-medium">{formatIDR(i.price * i.qty)}</span>
          </div>
        ))}
        <div className="flex items-center justify-between p-4">
          <span className="font-semibold">Total</span>
          <span className="text-lg font-bold text-brand-600">{formatIDR(order.total)}</span>
        </div>
      </div>

      {/* Status alur */}
      <div className="card p-5">
        <div className="flex items-center justify-between text-center text-xs">
          {(["menunggu", "diproses", "berhasil"] as OrderStatus[]).map((s, i) => {
            const order_ = ["menunggu", "diproses", "berhasil"];
            const active = order_.indexOf(status) >= i || status === "berhasil";
            return (
              <div key={s} className="flex-1">
                <div className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full ${active ? "bg-brand-600 text-white" : "bg-gray-200 text-gray-400"}`}>
                  {i + 1}
                </div>
                <p className="mt-1 text-gray-600">{ORDER_STATUS[s].label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Instruksi transfer */}
      {status !== "berhasil" && (
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900">Transfer ke salah satu rekening</h2>
          <div className="mt-3 space-y-2">
            {banks.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">{b.bank_name}</p>
                  <p className="font-mono text-sm">{b.account_number}</p>
                  <p className="text-xs text-gray-500">a.n. {b.account_name}</p>
                </div>
                <button
                  onClick={() => { navigator.clipboard?.writeText(b.account_number); setCopied(b.id); setTimeout(() => setCopied(null), 1500); }}
                  className="btn-outline shrink-0 px-3 py-1.5 text-xs"
                >
                  {copied === b.id ? "✓ Tersalin" : "📋 Salin No. Rek"}
                </button>
              </div>
            ))}
            {banks.length === 0 && <p className="text-sm text-gray-400">Rekening belum tersedia.</p>}
          </div>

          {/* QRIS */}
          {qrisImage && (
            <div className="mt-4 rounded-lg border border-gray-100 p-4 text-center">
              <p className="text-sm font-medium text-gray-800">Atau scan QRIS</p>
              <button type="button" onClick={() => setQrisZoom(true)} className="mt-2 inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrisImage} alt="QRIS" className="mx-auto h-48 w-48 rounded-lg border object-contain" />
                <span className="mt-1 block text-[11px] text-brand-600">🔍 Ketuk untuk perbesar</span>
              </button>
            </div>
          )}

          <div className="mt-5">
            <label className="label">Unggah bukti pembayaran</label>
            <input type="file" accept="image/*" onChange={onUpload} disabled={uploading} className="block w-full text-sm" />
            {uploading && <p className="mt-1 text-sm text-gray-500">Mengunggah…</p>}
          </div>
          {msg && <p className="mt-2 text-sm text-gray-600">{msg}</p>}
        </div>
      )}

      {proofUrl && (
        <div className="card p-5">
          <p className="mb-2 text-sm font-medium text-gray-700">Bukti bayar terunggah:</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={proofUrl} alt="Bukti bayar" className="max-h-64 rounded-lg border" />
        </div>
      )}

      {status === "berhasil" && (
        <div className="rounded-lg bg-green-50 p-4 text-center text-green-700">
          🎉 Pembayaran berhasil diverifikasi. Terima kasih!
        </div>
      )}

      {qrisZoom && qrisImage && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setQrisZoom(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrisImage} alt="QRIS" className="max-h-[90vh] max-w-full rounded-lg bg-white p-2 shadow-2xl" />
          <button
            type="button"
            onClick={() => setQrisZoom(false)}
            className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-sm font-medium"
          >
            ✕ Tutup
          </button>
        </div>
      )}
    </div>
  );
}
