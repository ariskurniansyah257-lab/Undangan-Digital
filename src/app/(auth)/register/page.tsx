"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const paket = params.get("paket");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) return setError("Nama wajib diisi.");
    if (password.length < 6)
      return setError("Password minimal 6 karakter.");
    if (password !== confirm)
      return setError("Konfirmasi password tidak cocok.");

    setLoading(true);
    const supabase = createClient();
    const { data, error: signErr } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim(), phone: phone.trim() || null },
      },
    });

    if (signErr) {
      setLoading(false);
      return setError(signErr.message);
    }

    // Tanpa konfirmasi email: bila sesi belum ada, coba login langsung.
    if (!data.session) {
      const { error: loginErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (loginErr) {
        setLoading(false);
        return setError(
          "Akun dibuat, namun login otomatis gagal. Silakan masuk manual.",
        );
      }
    }

    const target = paket ? `/dashboard?paket=${paket}` : "/dashboard";
    router.push(target);
    router.refresh();
  }

  return (
    <>
      <h1 className="text-xl font-bold text-gray-900">Buat akun</h1>
      <p className="mt-1 text-sm text-gray-500">
        Daftar untuk mulai membuat undangan digital.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="label">Nama lengkap</label>
          <input
            className="input"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nama Anda"
            required
          />
        </div>
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@contoh.com"
            required
          />
        </div>
        <div>
          <label className="label">
            No. Telepon <span className="text-gray-400">(opsional)</span>
          </label>
          <input
            className="input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="08xxxxxxxxxx"
          />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimal 6 karakter"
            required
          />
        </div>
        <div>
          <label className="label">Ulangi password</label>
          <input
            type="password"
            className="input"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Ketik ulang password"
            required
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Memproses…" : "Daftar"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-medium text-brand-600">
          Masuk
        </Link>
      </p>
    </>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
