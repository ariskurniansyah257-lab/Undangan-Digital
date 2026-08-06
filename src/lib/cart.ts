"use client";

export interface CartItem {
  key: string; // unik: `${type}:${id}`
  type: "package" | "product";
  refId: string;
  name: string;
  price: number;
  qty: number;
  themeId?: string; // tema yang dipilih (untuk item paket) → mengalir ke undangan
  themeSlug?: string;
  image?: string; // untuk pratinjau di keranjang
}

const KEY = "undangan_cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function save(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart-updated"));
}

export function addToCart(item: Omit<CartItem, "qty" | "key"> & { qty?: number }) {
  const key = `${item.type}:${item.refId}${item.themeId ? `:${item.themeId}` : ""}`;
  const cart = getCart();
  const existing = cart.find((c) => c.key === key);
  if (existing) {
    existing.qty += item.qty ?? 1;
  } else {
    cart.push({ ...item, key, qty: item.qty ?? 1 });
  }
  save(cart);
}

export function removeFromCart(key: string) {
  save(getCart().filter((c) => c.key !== key));
}

export function clearCart() {
  save([]);
}

export function cartTotal(items: CartItem[]) {
  return items.reduce((s, i) => s + i.price * i.qty, 0);
}
