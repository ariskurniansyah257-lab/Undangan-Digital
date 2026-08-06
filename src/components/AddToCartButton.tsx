"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { addToCart, type CartItem } from "@/lib/cart";

export default function AddToCartButton({
  item,
  className = "btn-primary",
  label = "Pesan",
  goToCart = false,
}: {
  item: Omit<CartItem, "qty" | "key">;
  className?: string;
  label?: string;
  goToCart?: boolean;
}) {
  const router = useRouter();
  const [added, setAdded] = useState(false);

  function handle() {
    addToCart(item);
    setAdded(true);
    if (goToCart) router.push("/cart");
    else setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button onClick={handle} className={className}>
      {added ? "✓ Ditambahkan" : label}
    </button>
  );
}
