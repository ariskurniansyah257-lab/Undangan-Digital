export const EVENT_TYPES = [
  { value: "wedding", label: "Pernikahan" },
] as const;

export type EventType = (typeof EVENT_TYPES)[number]["value"];

export const ORDER_STATUS = {
  menunggu: { label: "Menunggu Pembayaran", color: "amber" },
  diproses: { label: "Diproses", color: "blue" },
  berhasil: { label: "Berhasil", color: "green" },
  ditolak: { label: "Ditolak", color: "red" },
} as const;

export type OrderStatus = keyof typeof ORDER_STATUS;

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

/** Membuat slug URL-aman dari nama tamu (dipakai untuk ?to=). */
export function slugifyName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
