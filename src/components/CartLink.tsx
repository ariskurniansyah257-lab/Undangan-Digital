"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCart } from "@/lib/cart";

export default function CartLink() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const update = () => setCount(getCart().reduce((s, i) => s + i.qty, 0));
    update();
    window.addEventListener("cart-updated", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("cart-updated", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  return (
    <Link href="/cart" className="relative flex items-center text-gray-600 hover:text-brand-600" aria-label="Keranjang">
      <span className="text-xl">🛒</span>
      {count > 0 && (
        <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
