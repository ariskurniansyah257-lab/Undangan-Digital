"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ImageField from "@/components/ImageField";
import type { BankAdmin, Profile } from "@/lib/types";

export default function SettingsManager({
  settings,
  banks: initialBanks,
  profiles,
}: {
  settings: Record<string, string>;
  banks: BankAdmin[];
  profiles: Profile[];
}) {
  const supabase = createClient();
  const [whatsapp, setWhatsapp] = useState(settings.whatsapp_number ?? "");
  const [siteName, setSiteName] = useState(settings.site_name ?? "");
  const [qris, setQris] = useState(settings.qris_image ?? "");
  const [banks, setBanks] = useState(initialBanks);
  const [people, setPeople] = useState(profiles);
  const [msg, setMsg] = useState<string | null>(null);

  const [bName, setBName] = useState("");
  const [bNum, setBNum] = useState("");
  const [bAcc, setBAcc] = useState("");

  async function saveSetting(key: string, value: string) {
    await supabase.from("site_settings").upsert({ key, value }, { onConflict: "key" });
    setMsg("Tersimpan ✓");
  }

  async function addBank() {
    if (!bName || !bNum) return;
    const { data } = await supabase
      .from("banks_admin")
      .insert({ bank_name: bName, account_number: bNum, account_name: bAcc, sort_order: banks.length })
      .select("*")
      .single();
    if (data) setBanks([...banks, data as BankAdmin]);
    setBName(""); setBNum(""); setBAcc("");
  }
  async function delBank(id: string) {
    setBanks(banks.filter((b) => b.id !== id));
    await supabase.from("banks_admin").delete().eq("id", id);
  }

  async function setRole(p: Profile, role: string) {
    setPeople(people.map((x) => (x.id === p.id ? { ...x, role: role as any } : x)));
    await supabase.from("profiles").update({ role }).eq("id", p.id);
  }

  return (
    <div className="space-y-6">
      {msg && <p className="text-sm text-green-600">{msg}</p>}

      {/* Kontak & situs */}
      <section className="card space-y-3 p-5">
        <h2 className="font-semibold text-gray-900">Kontak & Situs</h2>
        <div>
          <label className="label">Nomor WhatsApp (mis. 6281234567890)</label>
          <div className="flex gap-2">
            <input className="input" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
            <button onClick={() => saveSetting("whatsapp_number", whatsapp)} className="btn-primary shrink-0">Simpan</button>
          </div>
        </div>
        <div>
          <label className="label">Nama situs</label>
          <div className="flex gap-2">
            <input className="input" value={siteName} onChange={(e) => setSiteName(e.target.value)} />
            <button onClick={() => saveSetting("site_name", siteName)} className="btn-primary shrink-0">Simpan</button>
          </div>
        </div>
      </section>

      {/* Rekening tujuan pembayaran */}
      <section className="card space-y-3 p-5">
        <h2 className="font-semibold text-gray-900">Rekening Tujuan Pembayaran</h2>
        <div className="space-y-2">
          {banks.map((b) => (
            <div key={b.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3 text-sm">
              <span>{b.bank_name} · {b.account_number} · a.n. {b.account_name}</span>
              <button onClick={() => delBank(b.id)} className="text-red-500">Hapus</button>
            </div>
          ))}
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <input className="input" placeholder="Bank" value={bName} onChange={(e) => setBName(e.target.value)} />
          <input className="input" placeholder="No. Rekening" value={bNum} onChange={(e) => setBNum(e.target.value)} />
          <input className="input" placeholder="Atas nama" value={bAcc} onChange={(e) => setBAcc(e.target.value)} />
        </div>
        <button onClick={addBank} className="btn-outline w-fit">+ Tambah Rekening</button>

        {/* QRIS */}
        <div className="mt-4 border-t border-gray-100 pt-4">
          <label className="label">Gambar QRIS</label>
          <p className="mb-2 text-xs text-gray-500">
            Unggah foto QRIS. Akan tampil di halaman pembayaran klien untuk discan.
          </p>
          <ImageField
            value={qris}
            label="QRIS"
            onChange={(url) => { setQris(url); saveSetting("qris_image", url); }}
          />
          {qris && (
            <div className="mt-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qris} alt="QRIS" className="h-40 w-40 rounded-lg border object-contain" />
            </div>
          )}
        </div>
      </section>

      {/* Sub-admin */}
      <section className="card p-5">
        <h2 className="font-semibold text-gray-900">Peran Pengguna & Sub-admin</h2>
        <p className="mb-3 text-sm text-gray-500">Naikkan pengguna menjadi sub-admin untuk membantu pengelolaan.</p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-gray-500">
              <tr><th className="py-2">Nama</th><th>Email</th><th>Peran</th><th></th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {people.map((p) => (
                <tr key={p.id}>
                  <td className="py-2 font-medium text-gray-800">{p.full_name || "—"}</td>
                  <td className="text-gray-600">{p.email}</td>
                  <td>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">{p.role}</span>
                  </td>
                  <td className="text-right">
                    {p.role === "sub_admin" ? (
                      <button onClick={() => setRole(p, "client")} className="text-xs text-gray-500">Jadikan Client</button>
                    ) : p.role === "client" ? (
                      <button onClick={() => setRole(p, "sub_admin")} className="text-xs text-brand-600">Jadikan Sub-admin</button>
                    ) : (
                      <span className="text-xs text-gray-400">Master admin</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
