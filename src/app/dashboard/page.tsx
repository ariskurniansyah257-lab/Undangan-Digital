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

  const invs = (invitations ?? []) as Invitation[];
  const ords = (orders ?? []) as Order[];

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
              <div
                key={o.id}
                className="flex items-center justify-between p-4"
              >
                <div>
                  <p className="font-medium text-gray-900">{o.invoice_no}</p>
                  <p className="text-sm text-gray-500">{formatIDR(o.total)}</p>
                </div>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                  {ORDER_STATUS[o.status].label}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
