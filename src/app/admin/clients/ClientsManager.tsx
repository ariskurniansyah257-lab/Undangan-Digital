"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { slugifyName } from "@/lib/constants";
import type { Profile, Package } from "@/lib/types";

export default function ClientsManager({
  profiles,
  packages,
  counts,
}: {
  profiles: Profile[];
  packages: Package[];
  counts: Record<string, number>;
}) {
  const supabase = createClient();
  const [sel, setSel] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<string | null>(null);

  async function assign(p: Profile) {
    const pkgId = sel[p.id] || packages[0]?.id;
    if (!pkgId) return;
    const pkg = packages.find((x) => x.id === pkgId);
    const slug = `${slugifyName(p.full_name || "undangan")}-${Math.random().toString(36).slice(2, 7)}`;
    const { error } = await supabase.from("invitations").insert({
      user_id: p.id,
      package_id: pkgId,
      title: `Undangan ${p.full_name || ""}`.trim(),
      slug,
      event_type: "wedding",
    });
    setMsg(error ? `Gagal: ${error.message}` : `Paket ${pkg?.name} diberikan ke ${p.full_name || p.email} ✓`);
  }

  return (
    <div className="space-y-4">
      {msg && <p className="text-sm text-green-600">{msg}</p>}
      <p className="text-sm text-gray-500">
        Beri paket manual dengan membuatkan draft undangan berpaket untuk klien.
        (Pembuatan akun baru butuh akses server/service-role dan dilakukan terpisah.)
      </p>
      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b border-gray-100 bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Telepon</th>
              <th className="px-4 py-3">Peran</th>
              <th className="px-4 py-3">Undangan</th>
              <th className="px-4 py-3">Assign Paket</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {profiles.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 font-medium text-gray-900">{p.full_name || "—"}</td>
                <td className="px-4 py-3 text-gray-600">{p.email}</td>
                <td className="px-4 py-3 text-gray-600">{p.phone || "—"}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">{p.role}</span>
                </td>
                <td className="px-4 py-3 text-gray-600">{counts[p.id] ?? 0}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <select
                      className="input py-1.5 text-xs"
                      value={sel[p.id] ?? ""}
                      onChange={(e) => setSel({ ...sel, [p.id]: e.target.value })}
                    >
                      {packages.map((pk) => <option key={pk.id} value={pk.id}>{pk.name}</option>)}
                    </select>
                    <button onClick={() => assign(p)} className="btn-outline px-3 py-1.5 text-xs">Beri</button>
                  </div>
                </td>
              </tr>
            ))}
            {profiles.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Belum ada akun.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
