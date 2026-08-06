import { createClient } from "@/lib/supabase/server";
import type { Package, Theme } from "@/lib/types";
import NewInvitationForm from "./NewInvitationForm";

export default async function NewInvitationPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: packages }, { data: themes }] = await Promise.all([
    supabase.from("packages").select("*").eq("is_active", true).order("sort_order"),
    supabase.from("themes").select("*").eq("is_active", true).order("sort_order"),
  ]);

  // Kuota paket: 1 paket dibeli = 1 undangan. Untuk tema/undangan lain, beli lagi
  // (seperti beli produk). Hitung paket berbayar (order berhasil) dikurangi paket
  // yang sudah terpakai oleh undangan milik user.
  const remaining: Record<string, number> = {};
  let gateActive = true;
  try {
    if (user) {
      const [{ data: paidItems, error: e1 }, { data: invs, error: e2 }] = await Promise.all([
        supabase
          .from("order_items")
          .select("package_id, qty, orders!inner(status, user_id)")
          .not("package_id", "is", null)
          .eq("orders.status", "berhasil")
          .eq("orders.user_id", user.id),
        supabase.from("invitations").select("package_id").eq("user_id", user.id),
      ]);
      // Bila query gagal (mis. RLS/relasi), matikan gate agar tidak mengunci user.
      if (e1 || e2) {
        gateActive = false;
      } else {
        for (const it of paidItems ?? []) {
          if (it.package_id) remaining[it.package_id] = (remaining[it.package_id] ?? 0) + (it.qty ?? 1);
        }
        for (const inv of invs ?? []) {
          if (inv.package_id) remaining[inv.package_id] = (remaining[inv.package_id] ?? 0) - 1;
        }
      }
    }
  } catch {
    gateActive = false;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Buat Undangan</h1>
        <p className="text-gray-500">
          Pilih paket & tema untuk memulai. Setiap paket berlaku untuk 1 undangan —
          untuk undangan/tema lain, pesan paket lagi.
        </p>
      </div>
      <NewInvitationForm
        packages={(packages ?? []) as Package[]}
        themes={(themes ?? []) as Theme[]}
        remaining={remaining}
        gateActive={gateActive}
      />
    </div>
  );
}
