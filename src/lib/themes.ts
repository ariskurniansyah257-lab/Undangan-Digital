// Palet visual per tema. Dipakai renderer undangan (via CSS variables) agar
// tiap paket/tema tampil berbeda. Semua nilai warna konkret (hex).

export interface ThemeStyle {
  slug: string;
  name: string;
  packageSlug: string;
  packageName: string;
  vars: {
    coverFrom: string;
    coverTo: string;
    accent: string; // aksen (emas/rose)
    heading: string; // warna judul
    tint: string; // background section selang-seling
    body: string; // background utama
  };
}

export const THEMES: ThemeStyle[] = [
  {
    slug: "classic-rose",
    name: "Classic Rose",
    packageSlug: "basic",
    packageName: "Basic",
    vars: { coverFrom: "#7a2438", coverTo: "#3d1420", accent: "#c19a4f", heading: "#872038", tint: "#fdf3f4", body: "#fffdfc" },
  },
  {
    slug: "elegant-gold",
    name: "Elegant Gold",
    packageSlug: "premium",
    packageName: "Premium",
    vars: { coverFrom: "#4a2f2a", coverTo: "#241715", accent: "#d4af6a", heading: "#5b3a22", tint: "#faf6ef", body: "#fdfbf7" },
  },
  {
    slug: "royal-luxury",
    name: "Royal Luxury",
    packageSlug: "luxury",
    packageName: "Luxury",
    vars: { coverFrom: "#1e3a34", coverTo: "#0f1f1c", accent: "#cbb26a", heading: "#1e3a34", tint: "#f0f5f2", body: "#fbfdfb" },
  },
  {
    slug: "motion-bloom",
    name: "Motion Bloom",
    packageSlug: "motion",
    packageName: "Motion",
    vars: { coverFrom: "#2a2444", coverTo: "#161227", accent: "#d9a3c9", heading: "#3a2a55", tint: "#f5f1fa", body: "#fdfcff" },
  },
  {
    slug: "sage-rustic",
    name: "Sage Rustic",
    packageSlug: "premium",
    packageName: "Premium",
    vars: { coverFrom: "#3f4a37", coverTo: "#232a1e", accent: "#a9a06b", heading: "#3f4a37", tint: "#f3f4ef", body: "#fcfdfa" },
  },
  {
    slug: "ocean-blue",
    name: "Ocean Blue",
    packageSlug: "luxury",
    packageName: "Luxury",
    vars: { coverFrom: "#1e3a5f", coverTo: "#0f1e33", accent: "#c9a86a", heading: "#1e3a5f", tint: "#eef3f8", body: "#fbfdff" },
  },
];

export function getTheme(slug: string | null | undefined): ThemeStyle {
  return THEMES.find((t) => t.slug === slug) ?? THEMES[1];
}
