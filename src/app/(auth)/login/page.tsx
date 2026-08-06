"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { identityToEmail } from "@/lib/auth-identity";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/dashboard";

  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: loginErr } = await supabase.auth.signInWithPassword({
      email: identityToEmail(identity),
      password,
    });

    if (loginErr) {
      setLoading(false);
      return setError("Email/No. HP atau password salah.");
    }

    router.push(redirect);
    router.refresh();
  }

  return (
    <>
      <h1 className="text-xl font-bold text-gray-900">Masuk</h1>
      <p className="mt-1 text-sm text-gray-500">
        Masuk ke dashboard undangan Anda.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="label">Email atau No. HP</label>
          <input
            className="input"
            value={identity}
            onChange={(e) => setIdentity(e.target.value)}
            placeholder="email@contoh.com atau 08xxxxxxxxxx"
            required
          />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Memproses…" : "Masuk"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Belum punya akun?{" "}
        <Link href="/register" className="font-medium text-brand-600">
          Daftar
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
