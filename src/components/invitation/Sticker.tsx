"use client";

import { OrnamentCorner } from "./Ornament";
import type { Sticker } from "@/lib/themes";

/** Style posisi/ukuran/rotasi sebuah ornamen tempel (persen relatif kanvas). */
export function stickerBoxStyle(s: Sticker): React.CSSProperties {
  return {
    position: "absolute",
    left: `${s.x}%`,
    top: `${s.y}%`,
    width: `${s.size}%`,
    transform: `translate(-50%, -50%) rotate(${s.rotation ?? 0}deg)`,
    opacity: s.opacity ?? 1,
  };
}

/** Isi visual ornamen tempel: motif bawaan (currentColor) atau gambar unggahan. */
export function StickerVisual({ s }: { s: Sticker }) {
  if (s.kind === "image" && s.src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={s.src} alt="" draggable={false} className="block w-full select-none" />;
  }
  return <OrnamentCorner type={s.ornament ?? "artistik"} className="block h-auto w-full" />;
}
