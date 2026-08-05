"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

export default function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [fullName, setFullName] = useState(profile.full_name);
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim(), phone: phone.trim() || null })
      .eq("id", profile.id);

    setLoading(false);
    setStatus(error ? `Gagal: ${error.message}` : "Tersimpan.");
    if (!error) router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card max-w-lg space-y-4 p-6">
      <div>
        <label className="label">Nama lengkap</label>
        <input
          className="input"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>
      <div>
        <label className="label">Email</label>
        <input className="input bg-gray-50" value={profile.email ?? ""} disabled />
      </div>
      <div>
        <label className="label">No. Telepon</label>
        <input
          className="input"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="08xxxxxxxxxx"
        />
      </div>
      {status && <p className="text-sm text-gray-600">{status}</p>}
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Menyimpan…" : "Simpan"}
      </button>
    </form>
  );
}
