import { createClient } from "@/lib/supabase/server";
import PaymentsManager from "./PaymentsManager";

export default async function AdminPaymentsPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(name, qty, price), profiles(full_name, email)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Approval Pembayaran</h1>
      <PaymentsManager initial={(orders ?? []) as any[]} />
    </div>
  );
}
