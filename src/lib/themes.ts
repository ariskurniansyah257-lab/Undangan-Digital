// Palet + ornamen per tema. Dipakai renderer undangan (via CSS variables +
// komponen Ornament). 5 tema konsep, tersedia di tiap paket.

export type OrnamentType = "jawa" | "padang" | "ceria" | "modern" | "artistik";

// Jenis animasi transisi antar-slide undangan (seperti transisi PPT).
export type AnimationType = "fade" | "morph" | "ppt" | "zoom" | "flip";

export const ANIMATIONS: { value: AnimationType; label: string }[] = [
  { value: "fade", label: "Fade Up (lembut naik)" },
  { value: "morph", label: "Morph (skala + blur)" },
  { value: "ppt", label: "Slide PPT (geser samping)" },
  { value: "zoom", label: "Zoom (membesar)" },
  { value: "flip", label: "Flip (putar 3D)" },
];

export interface ThemeVars {
  coverFrom: string;
  coverTo: string;
  accent: string;
  heading: string;
  tint: string;
  body: string;
}

export interface ThemeStyle {
  slug: string;
  name: string;
  packageSlug: string;
  packageName: string;
  ornament: OrnamentType;
  vars: ThemeVars;
}

// Override yang bisa disimpan admin di kolom themes.config (jsonb).
export interface ThemeConfigOverride {
  vars?: Partial<ThemeVars>;
  ornament?: OrnamentType;
  animation?: AnimationType;
  coverImage?: string | null;
}

// Tema efektif setelah base (dari slug) digabung override admin.
export interface ResolvedTheme extends ThemeStyle {
  animation: AnimationType;
  coverImage: string | null;
}

interface Concept {
  key: string;
  name: string;
  ornament: OrnamentType;
  vars: ThemeStyle["vars"];
}

// 5 konsep tema.
const CONCEPTS: Concept[] = [
  {
    key: "jawa",
    name: "Adat Jawa",
    ornament: "jawa",
    // Nuansa batik sogan: coklat & emas.
    vars: { coverFrom: "#5a3a1e", coverTo: "#2b1a0d", accent: "#c8a24a", heading: "#5a3a1e", tint: "#f7f0e4", body: "#fffdf8" },
  },
  {
    key: "padang",
    name: "Adat Padang",
    ornament: "padang",
    // Minang songket: merah marun, hitam, emas.
    vars: { coverFrom: "#7a1e1e", coverTo: "#1a0b0b", accent: "#e0b64a", heading: "#7a1e1e", tint: "#f9ede9", body: "#fffcfb" },
  },
  {
    key: "ceria",
    name: "Ceria & Hangat",
    ornament: "ceria",
    // Hangat: coral & peach cerah.
    vars: { coverFrom: "#e07a45", coverTo: "#9c3a2c", accent: "#ffbe55", heading: "#b8442e", tint: "#fff3e8", body: "#fffcf8" },
  },
  {
    key: "modern",
    name: "Modern",
    ornament: "modern",
    // Minimalis: charcoal & silver.
    vars: { coverFrom: "#2b2f36", coverTo: "#14171b", accent: "#9aa3ad", heading: "#222831", tint: "#f4f5f7", body: "#ffffff" },
  },
  {
    key: "artistik",
    name: "Artistik Ornamen",
    ornament: "artistik",
    // Mewah artistik: plum & emas.
    vars: { coverFrom: "#3a1f4d", coverTo: "#1a0f26", accent: "#d9b45a", heading: "#4a2a5e", tint: "#f5eff8", body: "#fffdff" },
  },
];

const PACKAGES: [string, string][] = [
  ["basic", "Basic"],
  ["premium", "Premium"],
  ["luxury", "Luxury"],
  ["motion", "Motion"],
];

export const THEMES: ThemeStyle[] = PACKAGES.flatMap(([ps, pn]) =>
  CONCEPTS.map((c) => ({
    slug: `${ps}-${c.key}`,
    name: c.name,
    packageSlug: ps,
    packageName: pn,
    ornament: c.ornament,
    vars: c.vars,
  })),
);

export function getTheme(slug: string | null | undefined): ThemeStyle {
  return THEMES.find((th) => th.slug === slug) ?? THEMES.find((th) => th.slug === "premium-jawa") ?? THEMES[0];
}

/**
 * Gabungkan tema dasar (dari slug) dengan override yang disimpan admin di
 * kolom themes.config. Menghasilkan tema efektif + jenis animasi + gambar cover.
 */
export function resolveTheme(
  slug: string | null | undefined,
  config?: Record<string, unknown> | null,
): ResolvedTheme {
  const base = getTheme(slug);
  const cfg = (config ?? {}) as ThemeConfigOverride;
  return {
    ...base,
    ornament: cfg.ornament ?? base.ornament,
    vars: { ...base.vars, ...(cfg.vars ?? {}) },
    animation: cfg.animation ?? "fade",
    coverImage: cfg.coverImage ?? null,
  };
}

/** Tema dikelompokkan per paket, menjaga urutan paket. */
export function themesByPackage(): { slug: string; name: string; themes: ThemeStyle[] }[] {
  return PACKAGES.map(([slug, name]) => ({
    slug,
    name,
    themes: THEMES.filter((th) => th.packageSlug === slug),
  }));
}
