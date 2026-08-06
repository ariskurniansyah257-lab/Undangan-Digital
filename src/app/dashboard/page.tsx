import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatIDR, ORDER_STATUS } from "@/lib/constants";
import type { Invitation, Order } from "@/lib/types";

export default async function DashboardHome() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: invitations } = await supabase
    .from("invitations")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // Produk yang sudah dibeli (item pesanan dengan product_id, milik user).
  const { data: purchased } = await supabase
    .from("order_items")
    .select("name, price, qty, product_id, orders!inner(status, user_id, created_at)")
    .not("product_id", "is", null)
    .eq("orders.user_id", user!.id);

  const invs = (invitations ?? []) as Invitation[];
  const ords = (orders ?? []) as Order[];
  const myProducts = (purchased ?? []) as any[];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ringkasan</h1>
          <p className="text-gray-500">Kelola undangan dan pesanan Anda.</p>
        </div>
        <Link href="/dashboard/invitations/new" className="btn-primary">
          + Buat Undangan
        </Link>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-800">
          Undangan Terbaru
        </h2>
        {invs.length === 0 ? (
          <div className="card p-8 text-center text-gray-500">
            <p>Belum ada undangan.</p>
            <Link
              href="/dashboard/invitations/new"
              className="btn-primary mt-4"
            >
              Buat undangan pertama
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {invs.map((inv) => (
              <Link
                key={inv.id}
                href={`/dashboard/invitations/${inv.id}`}
                className="card p-4 transition-shadow hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">
                    {inv.title || "Tanpa judul"}
                  </h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      inv.status === "published"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {inv.status === "published" ? "Publik" : "Draft"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">/{inv.slug}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Produk Saya</h2>
          <Link href="/dashboard/products" className="text-sm font-medium text-brand-600">
            + Beli produk
          </Link>
        </div>
        {myProducts.length === 0 ? (
          <div className="card p-6 text-center text-gray-500">
            Belum ada produk dibeli.{" "}
            <Link href="/dashboard/products" className="text-brand-600">Lihat katalog produk</Link>.
          </div>
        ) : (
          <div className="card divide-y divide-gray-100">
            {myProducts.map((it, i) => {
              const st = it.orders?.status as keyof typeof ORDER_STATUS | undefined;
              return (
                <div key={i} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium text-gray-900">{it.name}</p>
                    <p className="text-sm text-gray-500">{formatIDR(it.price)} × {it.qty}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      st === "berhasil" ? "bg-green-100 text-green-700"
                      : st === "ditolak" ? "bg-red-100 text-red-700"
                      : st === "diproses" ? "bg-blue-100 text-blue-700"
                      : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {st ? ORDER_STATUS[st].label : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-800">
          Pesanan Terbaru
        </h2>
        {ords.length === 0 ? (
          <div className="card p-6 text-center text-gray-500">
            Belum ada pesanan.
          </div>
        ) : (
          <div className="card divide-y divide-gray-100">
            {ords.map((o) => (
              <Link
                key={o.id}
                href={`/dashboard/orders/${o.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium text-gray-900">{o.invoice_no}</p>
                  <p className="text-sm text-gray-500">{formatIDR(o.total)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                    {ORDER_STATUS[o.status].label}
                  </span>
                  <span className="text-gray-400">›</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
