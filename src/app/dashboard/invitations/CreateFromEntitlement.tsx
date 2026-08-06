"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { slugifyName } from "@/lib/constants";

/** Membuat undangan dari paket/tema yang sudah dibayar (entitlement). */
export default function CreateFromEntitlement({
  packageId,
  themeId,
  orderId,
  title,
}: {
  packageId: string;
  themeId: string | null;
  orderId: string;
  title: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function create() {
    setLoading(true);
    setErr(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return setErr("Sesi berakhir, masuk lagi.");
    }
    const slug = `${slugifyName(title || "undangan")}-${Math.random().toString(36).slice(2, 7)}`;
    const { data, error } = await supabase
      .from("invitations")
      .insert({
        user_id: user.id,
        package_id: packageId,
        theme_id: themeId,
        order_id: orderId,
        title,
        slug,
        event_type: "wedding",
      })
      .select("id")
      .single();
    if (error) {
      setLoading(false);
      return setErr(error.message);
    }
    router.push(`/dashboard/invitations/${data.id}`);
    router.refresh();
  }

  return (
    <div>
      <button onClick={create} disabled={loading} className="btn-primary w-full text-sm">
        {loading ? "Membuat…" : "✨ Buat Undangan"}
      </button>
      {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
    </div>
  );
}
