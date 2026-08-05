"use client";

import Link from "next/link";
import CartLink from "./CartLink";

/** Header ringan untuk halaman client-component (mis. keranjang). */
export default function SiteHeaderClient() {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-brand-600">Undangan</span>
          <span className="text-xl font-light text-gray-800">Digital</span>
        </Link>
        <div className="flex items-center gap-4">
          <CartLink />
          <Link href="/dashboard" className="btn-primary">Dashboard</Link>
        </div>
      </div>
    </header>
  );
}
