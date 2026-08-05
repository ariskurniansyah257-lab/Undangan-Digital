"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ChangePasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    if (password.length < 6) return setStatus("Password minimal 6 karakter.");
    if (password !== confirm) return setStatus("Konfirmasi password tidak cocok.");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return setStatus(`Gagal: ${error.message}`);
    setPassword("");
    setConfirm("");
    setStatus("Kata sandi berhasil diubah ✓");
  }

  return (
    <form onSubmit={submit} className="card max-w-lg space-y-4 p-6">
      <h2 className="font-semibold text-gray-900">Ganti Kata Sandi</h2>
      <div>
        <label className="label">Kata sandi baru</label>
        <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 6 karakter" />
      </div>
      <div>
        <label className="label">Ulangi kata sandi baru</label>
        <input type="password" className="input" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </div>
      {status && (
        <p className={`text-sm ${status.startsWith("Gagal") || status.includes("tidak") || status.includes("minimal") ? "text-red-600" : "text-green-600"}`}>{status}</p>
      )}
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Menyimpan…" : "Ubah Kata Sandi"}
      </button>
    </form>
  );
}
