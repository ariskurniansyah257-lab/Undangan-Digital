// Palet visual per tema. Dipakai renderer undangan (via CSS variables) agar
// tiap paket/tema tampil berbeda. Minimal 4 varian per paket.

export interface ThemeStyle {
  slug: string;
  name: string;
  packageSlug: string;
  packageName: string;
  vars: {
    coverFrom: string;
    coverTo: string;
    accent: string;
    heading: string;
    tint: string;
    body: string;
  };
}

function t(
  slug: string, name: string, packageSlug: string, packageName: string,
  coverFrom: string, coverTo: string, accent: string, heading: string, tint: string, body: string,
): ThemeStyle {
  return { slug, name, packageSlug, packageName, vars: { coverFrom, coverTo, accent, heading, tint, body } };
}

export const THEMES: ThemeStyle[] = [
  // ---- BASIC ----
  t("classic-rose", "Classic Rose", "basic", "Basic", "#7a2438", "#3d1420", "#c19a4f", "#872038", "#fdf3f4", "#fffdfc"),
  t("ivory-minimal", "Ivory Minimal", "basic", "Basic", "#6b6459", "#332f28", "#a9925f", "#4a463d", "#f7f5f0", "#fffefb"),
  t("dusty-blue", "Dusty Blue", "basic", "Basic", "#3b4a63", "#1d2636", "#b9a06a", "#33425c", "#eef1f6", "#fbfcff"),
  t("terracotta-warm", "Terracotta Warm", "basic", "Basic", "#8a4a35", "#4a2419", "#d9a06a", "#7a3f2c", "#faf1ec", "#fffcfa"),

  // ---- PREMIUM ----
  t("elegant-gold", "Elegant Gold", "premium", "Premium", "#4a2f2a", "#241715", "#d4af6a", "#5b3a22", "#faf6ef", "#fdfbf7"),
  t("sage-rustic", "Sage Rustic", "premium", "Premium", "#3f4a37", "#232a1e", "#a9a06b", "#3f4a37", "#f3f4ef", "#fcfdfa"),
  t("blush-floral", "Blush Floral", "premium", "Premium", "#8a4a5a", "#472430", "#d9a3b0", "#7a3547", "#fbf1f4", "#fffdfe"),
  t("emerald-deco", "Emerald Deco", "premium", "Premium", "#1f4d3f", "#0f261f", "#cdb676", "#1f4d3f", "#eef5f1", "#fbfefc"),

  // ---- LUXURY ----
  t("royal-luxury", "Royal Luxury", "luxury", "Luxury", "#1e3a34", "#0f1f1c", "#cbb26a", "#1e3a34", "#f0f5f2", "#fbfdfb"),
  t("ocean-blue", "Ocean Blue", "luxury", "Luxury", "#1e3a5f", "#0f1e33", "#c9a86a", "#1e3a5f", "#eef3f8", "#fbfdff"),
  t("onyx-gold", "Onyx Gold", "luxury", "Luxury", "#2a2a2a", "#111111", "#d4af37", "#2a2a2a", "#f3f2ef", "#fdfdfb"),
  t("burgundy-velvet", "Burgundy Velvet", "luxury", "Luxury", "#5a1e2a", "#2c0e15", "#d4a35a", "#5a1e2a", "#f8eef0", "#fffcfd"),

  // ---- MOTION ----
  t("motion-bloom", "Motion Bloom", "motion", "Motion", "#2a2444", "#161227", "#d9a3c9", "#3a2a55", "#f5f1fa", "#fdfcff"),
  t("aurora-night", "Aurora Night", "motion", "Motion", "#152a3a", "#0a1620", "#6fd0c0", "#153a4a", "#eef5f6", "#fbfeff"),
  t("petal-fall", "Petal Fall", "motion", "Motion", "#6a2a44", "#331522", "#f0b3c4", "#5a2438", "#fbeff3", "#fffdfe"),
  t("golden-particle", "Golden Particle", "motion", "Motion", "#3a2e14", "#1c160a", "#f2c94c", "#4a3a18", "#f8f4e9", "#fffef9"),
];

export function getTheme(slug: string | null | undefined): ThemeStyle {
  return THEMES.find((th) => th.slug === slug) ?? THEMES[4];
}

/** Tema dikelompokkan per paket, menjaga urutan paket. */
export function themesByPackage(): { slug: string; name: string; themes: ThemeStyle[] }[] {
  const order = ["basic", "premium", "luxury", "motion"];
  return order.map((slug) => ({
    slug,
    name: THEMES.find((th) => th.packageSlug === slug)?.packageName ?? slug,
    themes: THEMES.filter((th) => th.packageSlug === slug),
  }));
}
