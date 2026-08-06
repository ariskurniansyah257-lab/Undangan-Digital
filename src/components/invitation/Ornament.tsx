"use client";

import { useId } from "react";
import type { OrnamentType } from "@/lib/themes";

/** Definisi tile pola per tema (motif orisinal geometris). Warna via currentColor. */
function patternTile(type: OrnamentType, id: string) {
  switch (type) {
    case "jawa":
      // Sulur batik: gelombang + titik, diputar 45°.
      return (
        <pattern id={id} width="46" height="46" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <path d="M4 23 q9 -13 18 0 q9 13 18 0" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="23" cy="8" r="2" fill="currentColor" />
          <circle cx="23" cy="38" r="2" fill="currentColor" />
        </pattern>
      );
    case "padang":
      // Songket: rhombus bersusun + titik tengah.
      return (
        <pattern id={id} width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M20 3 L37 20 L20 37 L3 20 Z" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path d="M20 11 L29 20 L20 29 L11 20 Z" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="20" cy="20" r="1.6" fill="currentColor" />
        </pattern>
      );
    case "ceria":
      // Ceria: titik + bintang 4 sudut + hati kecil.
      return (
        <pattern id={id} width="48" height="48" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="12" r="3" fill="currentColor" />
          <path d="M34 24 l1.8 5 5 1.8 -5 1.8 -1.8 5 -1.8 -5 -5 -1.8 5 -1.8 z" fill="currentColor" />
          <path d="M12 36 c-3 -3 -7 1 -4 4 l4 4 4 -4 c3 -3 -1 -7 -4 -4 z" fill="currentColor" opacity="0.85" />
        </pattern>
      );
    case "modern":
      // Modern: plus tipis jarang (grid minimal).
      return (
        <pattern id={id} width="44" height="44" patternUnits="userSpaceOnUse">
          <path d="M22 16 V28 M16 22 H28" stroke="currentColor" strokeWidth="1" />
        </pattern>
      );
    case "artistik":
    default:
      // Artistik: quatrefoil (empat lingkaran) + titik.
      return (
        <pattern id={id} width="54" height="54" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="currentColor" strokeWidth="1.2">
            <circle cx="27" cy="14" r="7.5" />
            <circle cx="27" cy="40" r="7.5" />
            <circle cx="14" cy="27" r="7.5" />
            <circle cx="40" cy="27" r="7.5" />
          </g>
          <circle cx="27" cy="27" r="2" fill="currentColor" />
        </pattern>
      );
  }
}

/** Lapisan pola memenuhi ruang induk (posisikan absolute + set warna/opacity via className). */
export function OrnamentPattern({ type, className }: { type: OrnamentType; className?: string }) {
  const raw = useId().replace(/[:]/g, "");
  const id = `orn-${raw}`;
  return (
    <svg className={className} aria-hidden preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <defs>{patternTile(type, id)}</defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/** Motif sudut dekoratif per tema. */
export function OrnamentCorner({ type, className }: { type: OrnamentType; className?: string }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.4 };
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden fill="none">
      {type === "jawa" && (
        <g>
          <path d="M4 116 C4 60 40 20 116 6" {...common} opacity={0.7} />
          <path d="M14 92 q10 -8 8 -20 q-2 -12 10 -16" {...common} />
          <circle cx="30" cy="70" r="6" fill="currentColor" opacity={0.5} />
          <circle cx="52" cy="48" r="4" fill="currentColor" opacity={0.5} />
        </g>
      )}
      {type === "padang" && (
        <g>
          <path d="M6 114 L6 70 L34 70 L34 42 L62 42" {...common} />
          <path d="M12 108 L24 96 L36 108" {...common} />
          <path d="M8 40 L24 24 L40 40 Z" fill="currentColor" opacity={0.4} />
        </g>
      )}
      {type === "ceria" && (
        <g fill="currentColor">
          <circle cx="18" cy="100" r="5" opacity={0.7} />
          <circle cx="40" cy="80" r="3.5" opacity={0.6} />
          <circle cx="70" cy="40" r="4" opacity={0.6} />
          <path d="M52 66 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2 z" opacity={0.8} />
        </g>
      )}
      {type === "modern" && (
        <g {...common}>
          <path d="M8 112 L8 72 M8 112 L48 112" />
          <circle cx="8" cy="72" r="3" fill="currentColor" />
        </g>
      )}
      {type === "artistik" && (
        <g {...common}>
          <path d="M2 118 C2 64 36 24 118 8" opacity={0.6} />
          <g strokeWidth={1.2}>
            <circle cx="24" cy="86" r="9" />
            <circle cx="46" cy="60" r="7" />
            <circle cx="72" cy="36" r="6" />
          </g>
          <circle cx="24" cy="86" r="2" fill="currentColor" />
          <circle cx="46" cy="60" r="1.6" fill="currentColor" />
        </g>
      )}
    </svg>
  );
}
