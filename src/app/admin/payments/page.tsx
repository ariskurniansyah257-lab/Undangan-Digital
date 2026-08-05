import { createClient } from "@/lib/supabase/server";
import { formatIDR, ORDER_STATUS } from "@/lib/constants";
import type { Order } from "@/lib/types";

export default async function AdminPaymentsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  const orders = (data ?? []) as Order[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Approval Pembayaran</h1>
      <p className="text-sm text-gray-500">
        Aksi persetujuan/penolakan & pratinjau bukti bayar diaktifkan di Fase 4.
        Daftar pesanan sudah tampil live di bawah.
      </p>
      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b border-gray-100 bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3">Invoice</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Bukti</th>
              <th className="px-4 py-3">Tanggal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {o.invoice_no}
                </td>
                <td className="px-4 py-3 text-gray-600">{formatIDR(o.total)}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                    {ORDER_STATUS[o.status].label}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {o.payment_proof_url ? "Ada" : "—"}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(o.created_at).toLocaleDateString("id-ID")}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  Belum ada pesanan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
