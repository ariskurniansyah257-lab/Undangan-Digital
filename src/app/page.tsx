import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import PhoneMockup from "@/components/landing/PhoneMockup";
import FaqAccordion from "@/components/landing/FaqAccordion";
import WhatsappFloat from "@/components/landing/WhatsappFloat";
import AddToCartButton from "@/components/AddToCartButton";
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

const FEATURES = [
  { icon: "🎉", title: "Multi Acara", desc: "Pernikahan, aqiqah, khitanan, ulang tahun, hingga seminar." },
  { icon: "✅", title: "RSVP & Ucapan", desc: "Tamu konfirmasi kehadiran dan kirim doa langsung dari undangan." },
  { icon: "🔗", title: "Link per Tamu", desc: "Nama tiap tamu tampil otomatis lewat tautan personal hingga 1000 tamu." },
  { icon: "🖼️", title: "Galeri Foto", desc: "Pamerkan momen terbaik, dengan galeri geser otomatis di paket tertentu." },
  { icon: "🎵", title: "Musik Latar", desc: "Pilih lagu latar untuk menghidupkan suasana undangan." },
  { icon: "📍", title: "Lokasi & Maps", desc: "Tautan Google Maps dan rangkaian acara dengan lokasi masing-masing." },
  { icon: "🎁", title: "Amplop Digital", desc: "Terima hadiah lewat transfer bank atau e-wallet dengan tombol salin." },
  { icon: "🎬", title: "Video & Motion", desc: "Upload video dan animasi bergerak premium di paket Luxury & Motion." },
];

const STEPS = [
  { n: "1", title: "Pilih Paket & Tema", desc: "Tentukan jenis acara dan tema favorit sesuai paket." },
  { n: "2", title: "Isi Data & Bayar", desc: "Lengkapi detail acara, unggah foto, lalu selesaikan pembayaran." },
  { n: "3", title: "Bagikan Undangan", desc: "Sebar tautan personal ke setiap tamu lewat WhatsApp." },
];

const TESTIMONIALS = [
  { name: "Rara & Fajar", text: "Prosesnya cepat dan hasilnya elegan. Tamu-tamu memuji undangannya!", role: "Pernikahan" },
  { name: "Keluarga Bapak Anwar", text: "Untuk aqiqah anak kami, undangannya rapi dan mudah dibagikan.", role: "Aqiqah" },
  { name: "Dinda", text: "Fitur RSVP-nya sangat membantu menghitung jumlah tamu.", role: "Ulang Tahun" },
];

// Paket fallback bila database belum terisi / tidak terjangkau.
const FALLBACK_PACKAGES = [
  { slug: "basic", name: "Basic", tagline: "Undangan digital esensial", price: 49000 },
  { slug: "premium", name: "Premium", tagline: "Lebih lengkap dengan galeri geser", price: 99000 },
  { slug: "luxury", name: "Luxury", tagline: "Video, galeri geser, dan lebih", price: 199000 },
  { slug: "motion", name: "Motion", tagline: "Animasi bergerak premium", price: 299000 },
];

export default async function HomePage() {
  let pkgs: Package[] = [];
  let feats: PackageFeature[] = [];
  let whatsapp = "6281234567890";

  try {
    const supabase = await createClient();
    const [{ data: packages }, { data: features }, { data: setting }] = await Promise.all([
      supabase.from("packages").select("*").eq("is_active", true).order("sort_order"),
      supabase.from("package_features").select("*").order("sort_order"),
      supabase.from("site_settings").select("value").eq("key", "whatsapp_number").maybeSingle(),
    ]);
    pkgs = (packages ?? []) as Package[];
    feats = (features ?? []) as PackageFeature[];
    if (setting?.value) whatsapp = setting.value;
  } catch {
    // DB tak terjangkau (mis. build/preview) — pakai fallback.
  }

  const displayPkgs =
    pkgs.length > 0 ? pkgs : (FALLBACK_PACKAGES as unknown as Package[]);

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
              ✨ Platform Undangan Digital #1 untuk Setiap Momen
            </span>
            <h1 className="mt-4 font-serif text-4xl leading-tight text-gray-900 sm:text-5xl">
              Undangan digital yang <span className="text-brand-600">elegan</span> &amp;
              berkesan
            </h1>
            <p className="mt-5 max-w-lg text-lg text-gray-600">
              Buat undangan pernikahan, aqiqah, khitanan, ulang tahun, hingga
              seminar dalam hitungan menit. Bagikan tautan personal untuk setiap
              tamu.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="btn-primary px-6 py-3 text-base">
                Buat Undangan Sekarang
              </Link>
              <Link href="/u/demo" className="btn-outline px-6 py-3 text-base">
                Lihat Contoh Undangan
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-gray-500">
              <div>
                <p className="text-xl font-bold text-gray-900">5000+</p>
                <p>Undangan dibuat</p>
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">4.9/5</p>
                <p>Rating pengguna</p>
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">1000</p>
                <p>Tamu / undangan</p>
              </div>
            </div>
          </div>
          <div className="relative flex justify-center">
            <div className="absolute inset-0 -z-10 mx-auto h-72 w-72 rounded-full bg-brand-100/60 blur-3xl" />
            <PhoneMockup className="rotate-3" />
          </div>
        </div>
      </section>

      {/* FITUR */}
      <section id="fitur" className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center">
          <h2 className="font-serif text-3xl text-gray-900">Fitur lengkap</h2>
          <p className="mt-2 text-gray-600">Semua yang Anda butuhkan untuk undangan sempurna.</p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-6 transition-shadow hover:shadow-md">
              <span className="text-3xl">{f.icon}</span>
              <h3 className="mt-3 font-semibold text-gray-900">{f.title}</h3>
              <p className="mt-1 text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* JENIS ACARA */}
      <section id="acara" className="bg-gray-50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center font-serif text-3xl text-gray-900">
            Untuk berbagai acara
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
        </div>
      </section>

      {/* TEMA SHOWCASE */}
      <section id="tema" className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center">
          <h2 className="font-serif text-3xl text-gray-900">Tema untuk setiap paket</h2>
          <p className="mt-2 text-gray-600">Dari klasik elegan hingga animasi bergerak.</p>
        </div>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { name: "Classic Rose", pkg: "Basic", slug: "basic", accent: "from-brand-700 to-brand-900" },
            { name: "Elegant Gold", pkg: "Premium", slug: "premium", accent: "from-[#4a2f2a] to-[#241715]" },
            { name: "Royal Luxury", pkg: "Luxury", slug: "luxury", accent: "from-[#1e3a34] to-[#0f1f1c]" },
            { name: "Motion Bloom", pkg: "Motion", slug: "motion", accent: "from-[#2a2444] to-[#161227]" },
          ].map((t) => {
            const tp = displayPkgs.find((p) => p.slug === t.slug);
            const price = (tp as Package)?.discount_price ?? tp?.price ?? 0;
            return (
              <div key={t.name} className="flex flex-col items-center">
                <PhoneMockup accent={t.accent} />
                <h3 className="mt-4 font-medium text-gray-900">{t.name}</h3>
                <span className="mt-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs text-brand-600">
                  {t.pkg}
                </span>
                <AddToCartButton
                  item={{ type: "package", refId: t.slug, name: `Paket ${t.pkg} — ${t.name}`, price }}
                  goToCart
                  label="Pesan Tema Ini"
                  className="btn-outline mt-3 px-4 py-1.5 text-xs"
                />
              </div>
            );
          })}
        </div>
      </section>

      {/* CARA KERJA */}
      <section className="bg-brand-600 py-16 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center font-serif text-3xl">Cara kerja</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-xl font-bold">
                  {s.n}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-white/80">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PAKET */}
      <section id="paket" className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center">
          <h2 className="font-serif text-3xl text-gray-900">Pilih paket</h2>
          <p className="mt-2 text-gray-600">Harga terjangkau untuk setiap kebutuhan.</p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {displayPkgs.map((pkg, i) => {
            const pkgFeats = feats.filter((f) => f.package_id === pkg.id);
            const highlighted = i === 2;
            return (
              <div
                key={pkg.slug}
                className={`card flex flex-col p-6 ${highlighted ? "ring-2 ring-brand-500" : ""}`}
              >
                {highlighted && (
                  <span className="mb-2 inline-block w-fit rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
                    Terpopuler
                  </span>
                )}
                <h3 className="text-lg font-bold text-gray-900">{pkg.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{pkg.tagline}</p>
                <p className="mt-4 text-2xl font-bold text-brand-600">
                  {formatIDR((pkg as Package).discount_price ?? pkg.price)}
                </p>
                {pkgFeats.length > 0 && (
                  <ul className="mt-4 flex-1 space-y-2 text-sm">
                    {pkgFeats.map((f) => (
                      <li
                        key={f.id}
                        className={`flex items-start gap-2 ${f.included ? "text-gray-700" : "text-gray-400"}`}
                      >
                        <span>{f.included ? "✓" : "✕"}</span>
                        <span>{f.label}{f.value ? `: ${f.value}` : ""}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <AddToCartButton
                  item={{
                    type: "package",
                    refId: pkg.slug,
                    name: `Paket ${pkg.name}`,
                    price: (pkg as Package).discount_price ?? pkg.price,
                  }}
                  goToCart
                  label={`Pesan ${pkg.name}`}
                  className={`mt-6 ${highlighted ? "btn-primary" : "btn-outline"}`}
                />
              </div>
            );
          })}
        </div>
      </section>

      {/* TESTIMONI */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center font-serif text-3xl text-gray-900">
            Kata mereka
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="card p-6">
                <p className="text-yellow-400">★★★★★</p>
                <p className="mt-3 text-sm italic text-gray-600">&ldquo;{t.text}&rdquo;</p>
                <p className="mt-4 font-semibold text-gray-900">{t.name}</p>
                <p className="text-xs text-gray-400">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center font-serif text-3xl text-gray-900">
          Pertanyaan umum
        </h2>
        <div className="mt-10">
          <FaqAccordion />
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="rounded-3xl bg-gradient-to-r from-brand-600 to-brand-800 px-8 py-14 text-center text-white">
          <h2 className="font-serif text-3xl">Siap membuat undangan Anda?</h2>
          <p className="mt-3 text-white/80">Mulai gratis, bayar saat siap dipublikasikan.</p>
          <Link
            href="/register"
            className="mt-6 inline-flex rounded-lg bg-white px-6 py-3 font-semibold text-brand-700 hover:bg-gray-100"
          >
            Daftar Sekarang
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 bg-gray-50 py-12">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <p className="font-serif text-xl">
              <span className="font-bold text-brand-600">Undangan</span>
              <span className="text-gray-800">Digital</span>
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Platform undangan digital untuk setiap momen berharga.
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-800">Produk</p>
            <ul className="mt-3 space-y-2 text-sm text-gray-500">
              <li><Link href="/#fitur" className="hover:text-brand-600">Fitur</Link></li>
              <li><Link href="/#tema" className="hover:text-brand-600">Tema</Link></li>
              <li><Link href="/#paket" className="hover:text-brand-600">Paket</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-gray-800">Bantuan</p>
            <ul className="mt-3 space-y-2 text-sm text-gray-500">
              <li><Link href="/#faq" className="hover:text-brand-600">FAQ</Link></li>
              <li><Link href="/u/demo" className="hover:text-brand-600">Contoh Undangan</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-gray-800">Akun</p>
            <ul className="mt-3 space-y-2 text-sm text-gray-500">
              <li><Link href="/login" className="hover:text-brand-600">Masuk</Link></li>
              <li><Link href="/register" className="hover:text-brand-600">Daftar</Link></li>
            </ul>
          </div>
        </div>
        <p className="mt-10 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} Undangan Digital. Semua hak dilindungi.
        </p>
      </footer>

      <WhatsappFloat number={whatsapp} />
    </div>
  );
}
