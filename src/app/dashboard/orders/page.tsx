import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatIDR, ORDER_STATUS } from "@/lib/constants";
import type { Order } from "@/lib/types";

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const orders = (data ?? []) as Order[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Pesanan</h1>

      {orders.length === 0 ? (
        <div className="card p-10 text-center text-gray-500">
          Belum ada pesanan. Pesanan muncul setelah Anda memilih paket/produk dan checkout.
        </div>
      ) : (
        <div className="card divide-y divide-gray-100">
          {orders.map((o) => (
            <Link
              key={o.id}
              href={`/dashboard/orders/${o.id}`}
              className="flex items-center justify-between gap-3 p-4 hover:bg-gray-50"
            >
              <div className="min-w-0">
                <p className="font-medium text-gray-900">{o.invoice_no}</p>
                <p className="text-sm text-gray-500">
                  {formatIDR(o.total)} ·{" "}
                  {new Date(o.created_at).toLocaleDateString("id-ID")}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                  {ORDER_STATUS[o.status].label}
                </span>
                <span className="text-gray-400">›</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
