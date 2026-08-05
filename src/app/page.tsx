import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { createClient } from "@/lib/supabase/server";
import { EVENT_TYPES, formatIDR } from "@/lib/constants";
import type { Package, PackageFeature } from "@/lib/types";

export const revalidate = 60;

const EVENT_EMOJI: Record<string, string> = {
  wedding: "💍",
  aqiqah: "👶",
  khitanan: "🎈",
  ulang_tahun: "🎂",
  seminar: "🎓",
};

export default async function HomePage() {
  const supabase = await createClient();

  const { data: packages } = await supabase
    .from("packages")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  const { data: features } = await supabase
    .from("package_features")
    .select("*")
    .order("sort_order");

  const pkgs = (packages ?? []) as Package[];
  const feats = (features ?? []) as PackageFeature[];

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-brand-600">
            Platform Undangan Digital
          </p>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
            Undangan digital untuk{" "}
            <span className="text-brand-600">setiap momen berharga</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-600">
            Pernikahan, aqiqah, khitanan, ulang tahun, hingga seminar. Pilih
            tema, atur rangkaian acara, kelola tamu, dan bagikan tautan personal
            untuk setiap tamu.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/register" className="btn-primary px-6 py-3 text-base">
              Mulai Buat Undangan
            </Link>
            <Link href="/#paket" className="btn-outline px-6 py-3 text-base">
              Lihat Paket
            </Link>
          </div>
        </div>
      </section>

      {/* JENIS ACARA */}
      <section id="acara" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold text-gray-900">
          Untuk berbagai jenis acara
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {EVENT_TYPES.map((e) => (
            <div
              key={e.value}
              className="card flex flex-col items-center gap-2 p-6 text-center transition-shadow hover:shadow-md"
            >
              <span className="text-3xl">{EVENT_EMOJI[e.value]}</span>
              <span className="font-medium text-gray-800">{e.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* PAKET */}
      <section id="paket" className="bg-gray-50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold text-gray-900">
            Pilih paket sesuai kebutuhan
          </h2>
          <p className="mt-2 text-center text-gray-600">
            Basic, Premium, Luxury, hingga Motion.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {pkgs.map((pkg, i) => {
              const pkgFeats = feats.filter((f) => f.package_id === pkg.id);
              const highlighted = i === 2; // Luxury
              return (
                <div
                  key={pkg.id}
                  className={`card flex flex-col p-6 ${
                    highlighted ? "ring-2 ring-brand-500" : ""
                  }`}
                >
                  {highlighted && (
                    <span className="mb-2 inline-block w-fit rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
                      Terpopuler
                    </span>
                  )}
                  <h3 className="text-lg font-bold text-gray-900">{pkg.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{pkg.tagline}</p>
                  <p className="mt-4 text-2xl font-bold text-brand-600">
                    {formatIDR(pkg.discount_price ?? pkg.price)}
                  </p>
                  <ul className="mt-4 flex-1 space-y-2 text-sm">
                    {pkgFeats.map((f) => (
                      <li
                        key={f.id}
                        className={`flex items-start gap-2 ${
                          f.included ? "text-gray-700" : "text-gray-400"
                        }`}
                      >
                        <span>{f.included ? "✓" : "✕"}</span>
                        <span>
                          {f.label}
                          {f.value ? `: ${f.value}` : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/register?paket=${pkg.slug}`}
                    className={
                      highlighted
                        ? "btn-primary mt-6"
                        : "btn-outline mt-6"
                    }
                  >
                    Pilih {pkg.name}
                  </Link>
                </div>
              );
            })}
          </div>

          {pkgs.length === 0 && (
            <p className="mt-8 text-center text-gray-500">
              Paket belum tersedia. Jalankan migrasi seed database terlebih
              dahulu.
            </p>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 py-10">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-gray-500">
          <p className="font-semibold text-gray-700">Undangan Digital</p>
          <p className="mt-2">
            © {new Date().getFullYear()} — Platform undangan digital SaaS.
          </p>
        </div>
      </footer>
    </div>
  );
}
