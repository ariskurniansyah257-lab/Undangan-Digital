import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { BankAdmin } from "@/lib/types";
import OrderPayment from "./OrderPayment";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(name, qty, price)")
    .eq("id", id)
    .maybeSingle();
  if (!order) notFound();

  const [{ data: banks }, { data: qrisRow }] = await Promise.all([
    supabase.from("banks_admin").select("*").eq("is_active", true).order("sort_order"),
    supabase.from("site_settings").select("value").eq("key", "qris_image").maybeSingle(),
  ]);
  const qrisImage = (qrisRow?.value as string | undefined) || null;

  return (
    <div className="space-y-6">
      <Link href="/dashboard/orders" className="text-sm text-gray-500 hover:text-brand-600">
        ← Pesanan
      </Link>
      <OrderPayment order={order} banks={(banks ?? []) as BankAdmin[]} qrisImage={qrisImage} />
    </div>
  );
}
