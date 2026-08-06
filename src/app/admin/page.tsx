import { createClient } from "@/lib/supabase/server";

async function count(table: string, filter?: (q: any) => any) {
  const supabase = await createClient();
  let q = supabase.from(table).select("*", { count: "exact", head: true });
  if (filter) q = filter(q);
  const { count: c } = await q;
  return c ?? 0;
}

export default async function AdminHome() {
  const [clients, pendingPayments, invitations, songs] = await Promise.all([
    count("profiles", (q) => q.eq("role", "client")),
    count("orders", (q) => q.in("status", ["menunggu", "diproses"])),
    count("invitations"),
    count("songs"),
  ]);

  const stats = [
    { label: "Akun Client", value: clients, icon: "👥" },
    { label: "Pembayaran Perlu Ditinjau", value: pendingPayments, icon: "💳" },
    { label: "Total Undangan", value: invitations, icon: "💌" },
    { label: "Lagu Tersedia", value: songs, icon: "🎵" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Ringkasan</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <div className="flex items-center justify-between">
              <span className="text-2xl">{s.icon}</span>
              <span className="text-3xl font-bold text-gray-900">
                {s.value}
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
