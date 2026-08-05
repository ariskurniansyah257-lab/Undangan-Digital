"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { InvitationView } from "@/lib/invitation-view";

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

function formatDateID(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function useCountdown(targetIso: string | null) {
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!targetIso) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  const target = new Date(targetIso + "T00:00:00").getTime();
  const diff = Math.max(0, target - now);
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    done: diff === 0,
  };
}

/* ---------- Dekorasi bunga (SVG inline) ---------- */
function FloralCorner({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden fill="none">
      <path d="M2 118C2 60 40 20 118 2" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <g fill="currentColor" opacity="0.6">
        <circle cx="20" cy="90" r="5" />
        <circle cx="34" cy="70" r="7" />
        <circle cx="52" cy="52" r="6" />
        <circle cx="72" cy="36" r="8" />
        <circle cx="94" cy="22" r="5" />
        <path d="M34 70c-8-4-14 2-16 10 8 2 14-2 16-10z" />
        <path d="M72 36c-4-8-12-8-18-4 4 7 12 8 18 4z" />
      </g>
    </svg>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-6 text-center font-serif text-2xl text-gold-600 sm:text-3xl">
      {children}
    </h2>
  );
}

export default function InvitationExperience({
  data,
  guestName,
}: {
  data: InvitationView;
  guestName: string;
}) {
  const [opened, setOpened] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cd = useCountdown(data.mainDate);

  // Kunci scroll saat cover masih tampil.
  useEffect(() => {
    document.body.style.overflow = opened ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [opened]);

  function handleOpen() {
    setOpened(true);
    if (audioRef.current) {
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
    window.scrollTo({ top: 0 });
  }

  function toggleMusic() {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play().then(() => setPlaying(true)).catch(() => {});
    }
  }

  return (
    <div className="relative mx-auto min-h-screen max-w-lg overflow-hidden bg-[#fdfbf7] text-gray-700 shadow-2xl">
      {data.songUrl && (
        <audio ref={audioRef} src={data.songUrl} loop preload="auto" />
      )}

      {/* ============ COVER ============ */}
      <div
        className={`fixed inset-0 z-50 mx-auto flex max-w-lg flex-col items-center justify-center px-8 text-center transition-all duration-700 ${
          opened ? "pointer-events-none translate-y-[-100%] opacity-0" : "opacity-100"
        }`}
        style={{
          background:
            "linear-gradient(rgba(30,18,14,0.55),rgba(30,18,14,0.75)), radial-gradient(circle at 50% 20%, #4a2f2a, #241715)",
        }}
      >
        <FloralCorner className="absolute left-0 top-0 h-28 w-28 text-gold-400" />
        <FloralCorner className="absolute bottom-0 right-0 h-28 w-28 rotate-180 text-gold-400" />
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-gold-400">
          The Wedding Of
        </p>
        <h1 className="font-serif text-4xl text-white sm:text-5xl">
          {data.groom.name} &amp; {data.bride.name}
        </h1>
        <div className="my-6 h-px w-16 bg-gold-400/60" />
        <p className="text-sm text-white/70">Kepada Yth. Bapak/Ibu/Saudara/i</p>
        <p className="mt-2 rounded-lg bg-white/10 px-5 py-2 font-serif text-xl text-white backdrop-blur">
          {guestName}
        </p>
        <button
          onClick={handleOpen}
          className="mt-10 inline-flex items-center gap-2 rounded-full bg-gold-500 px-7 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105"
        >
          ✉️ Buka Undangan
        </button>
      </div>

      {/* ============ TOMBOL MUSIK ============ */}
      {opened && data.songUrl && (
        <button
          onClick={toggleMusic}
          className="fixed bottom-5 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-gold-500 text-white shadow-lg"
          aria-label="Putar/Jeda musik"
        >
          <span className={playing ? "animate-spin-slow" : ""}>{playing ? "♫" : "▶"}</span>
        </button>
      )}

      {/* ============ ISI UNDANGAN ============ */}
      <div className={opened ? "opacity-100" : "opacity-0"}>
        {/* HERO */}
        <section className="relative flex min-h-screen flex-col items-center justify-center px-6 py-20 text-center">
          <FloralCorner className="absolute left-0 top-0 h-24 w-24 text-brand-200" />
          <FloralCorner className="absolute bottom-0 right-0 h-24 w-24 rotate-180 text-brand-200" />
          <p className="text-xs uppercase tracking-[0.3em] text-gold-500">The Wedding Of</p>
          <h1 className="mt-4 font-serif text-5xl text-brand-800">{data.groom.name}</h1>
          <p className="my-2 font-serif text-2xl text-gold-500">&amp;</p>
          <h1 className="font-serif text-5xl text-brand-800">{data.bride.name}</h1>
          <p className="mt-6 text-sm text-gray-500">{formatDateID(data.mainDate)}</p>

          {/* Countdown */}
          <div className="mt-8 flex gap-3">
            {[
              { v: cd.days, l: "Hari" },
              { v: cd.hours, l: "Jam" },
              { v: cd.minutes, l: "Menit" },
              { v: cd.seconds, l: "Detik" },
            ].map((c) => (
              <div key={c.l} className="flex w-16 flex-col rounded-xl bg-white/80 py-3 shadow-sm ring-1 ring-brand-100">
                <span className="font-serif text-2xl text-brand-700">{c.v}</span>
                <span className="text-[11px] text-gray-400">{c.l}</span>
              </div>
            ))}
          </div>
        </section>

        {/* QUOTE */}
        {data.quoteText && (
          <section className="bg-brand-50/50 px-8 py-16 text-center">
            <p className="mx-auto max-w-md font-serif text-lg italic leading-relaxed text-gray-600">
              &ldquo;{data.quoteText}&rdquo;
            </p>
            {data.quoteSource && (
              <p className="mt-4 text-sm font-semibold text-gold-600">({data.quoteSource})</p>
            )}
          </section>
        )}

        {/* MEMPELAI */}
        <section className="px-6 py-16">
          <SectionTitle>Mempelai</SectionTitle>
          <p className="mb-10 text-center text-sm text-gray-500">{data.coupleTagline}</p>
          <div className="space-y-10">
            {[data.groom, data.bride].map((p, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                {p.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.photo}
                    alt={p.name}
                    className="h-28 w-28 rounded-full object-cover ring-4 ring-white shadow"
                  />
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-gold-400/40 font-serif text-3xl text-brand-700 ring-4 ring-white shadow">
                    {p.name.charAt(0)}
                  </div>
                )}
                <h3 className="mt-4 font-serif text-2xl text-brand-800">{p.fullName || p.name}</h3>
                {p.parents && <p className="mt-2 max-w-xs text-sm text-gray-500">{p.parents}</p>}
                {p.instagram && (
                  <a
                    href={`https://instagram.com/${p.instagram}`}
                    className="mt-2 inline-flex items-center gap-1 text-sm text-brand-600"
                  >
                    ⓘ @{p.instagram}
                  </a>
                )}
                {i === 0 && <p className="mt-8 font-serif text-3xl text-gold-500">&amp;</p>}
              </div>
            ))}
          </div>
        </section>

        {/* ACARA */}
        <section className="bg-brand-50/50 px-6 py-16">
          <SectionTitle>Rangkaian Acara</SectionTitle>
          <div className="space-y-6">
            {data.events.map((ev, i) => (
              <div key={i} className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-brand-100">
                <h3 className="font-serif text-xl text-brand-700">{ev.name}</h3>
                <p className="mt-2 text-sm text-gray-600">{formatDateID(ev.date)}</p>
                {(ev.startTime || ev.endTime) && (
                  <p className="text-sm text-gray-600">
                    {ev.startTime}
                    {ev.endTime ? ` – ${ev.endTime}` : ""} WIB
                  </p>
                )}
                {ev.locationName && (
                  <p className="mt-2 font-medium text-gray-800">{ev.locationName}</p>
                )}
                {ev.locationAddress && (
                  <p className="text-sm text-gray-500">{ev.locationAddress}</p>
                )}
                {ev.mapUrl && (
                  <a
                    href={ev.mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex rounded-full bg-brand-600 px-5 py-2 text-sm font-medium text-white"
                  >
                    📍 Lihat Lokasi
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CERITA / OUR JOURNEY */}
        {data.story.length > 0 && (
          <section className="px-6 py-16">
            <SectionTitle>Our Journey</SectionTitle>
            <div className="relative ml-3 space-y-8 border-l-2 border-brand-100 pl-6">
              {data.story.map((s, i) => (
                <div key={i} className="relative">
                  <span className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-gold-400 ring-4 ring-white" />
                  <h3 className="font-serif text-lg text-brand-700">{s.title}</h3>
                  {s.storyDate && (
                    <p className="text-xs text-gold-600">{formatDateID(s.storyDate)}</p>
                  )}
                  {s.story && <p className="mt-1 text-sm leading-relaxed text-gray-600">{s.story}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* GALERI */}
        {data.gallery.length > 0 && (
          <section className="bg-brand-50/50 px-6 py-16">
            <SectionTitle>Galeri</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              {data.gallery.map((g, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={g.imageUrl}
                  alt={g.caption ?? ""}
                  className="aspect-square w-full rounded-xl object-cover"
                />
              ))}
            </div>
          </section>
        )}

        {/* GIFT */}
        {data.banks.length > 0 && (
          <section className="px-6 py-16">
            <SectionTitle>Amplop Digital</SectionTitle>
            <p className="mb-8 text-center text-sm text-gray-500">
              Doa restu Anda adalah karunia terindah. Bila berkenan memberi tanda kasih,
              dapat melalui:
            </p>
            <div className="space-y-4">
              {data.banks.map((b, i) => (
                <GiftCard key={i} bank={b} />
              ))}
            </div>
          </section>
        )}

        {/* RSVP */}
        <section className="bg-brand-50/50 px-6 py-16">
          <SectionTitle>Konfirmasi Kehadiran</SectionTitle>
          <RSVPBlock invitationId={data.id} defaultName={guestName} />
        </section>

        {/* CLOSING */}
        <section className="relative px-6 py-20 text-center">
          <p className="mx-auto max-w-md text-sm leading-relaxed text-gray-600">
            {data.closingMessage}
          </p>
          <div className="my-8 mx-auto h-px w-16 bg-gold-400/60" />
          <p className="text-xs uppercase tracking-[0.3em] text-gold-500">Wassalam</p>
          <h2 className="mt-3 font-serif text-3xl text-brand-800">
            {data.groom.name} &amp; {data.bride.name}
          </h2>
          {data.hashtag && (
            <p className="mt-4 text-sm font-semibold text-brand-600">{data.hashtag}</p>
          )}
          <p className="mt-10 text-xs text-gray-400">
            Undangan digital oleh{" "}
            <a href="/" className="text-brand-600">Undangan Digital</a>
          </p>
        </section>
      </div>
    </div>
  );
}

/* ---------- Kartu rekening dengan tombol salin ---------- */
function GiftCard({ bank }: { bank: { bankName: string; accountNumber: string; accountName: string } }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 p-5 text-white shadow-md">
      <p className="text-sm opacity-80">{bank.bankName}</p>
      <p className="mt-2 font-mono text-xl tracking-wider">{bank.accountNumber}</p>
      <p className="mt-1 text-sm opacity-90">a.n. {bank.accountName}</p>
      <button
        onClick={() => {
          navigator.clipboard?.writeText(bank.accountNumber);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="mt-3 rounded-full bg-white/20 px-4 py-1.5 text-xs font-medium backdrop-blur"
      >
        {copied ? "✓ Tersalin" : "Salin No. Rekening"}
      </button>
    </div>
  );
}

/* ---------- Blok RSVP + ucapan ---------- */
interface Wish {
  name: string;
  message: string | null;
  attendance: string;
}

function RSVPBlock({
  invitationId,
  defaultName,
}: {
  invitationId: string | null;
  defaultName: string;
}) {
  const isDemo = !invitationId;
  const [name, setName] = useState(defaultName === "Tamu Undangan" ? "" : defaultName);
  const [attendance, setAttendance] = useState("hadir");
  const [guests, setGuests] = useState(1);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [wishes, setWishes] = useState<Wish[]>([]);

  const supabase = useMemo(() => (isDemo ? null : createClient()), [isDemo]);

  useEffect(() => {
    if (!supabase || !invitationId) return;
    supabase
      .from("rsvps")
      .select("name, message, attendance")
      .eq("invitation_id", invitationId)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => setWishes((data as Wish[]) ?? []));
  }, [supabase, invitationId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setStatus("loading");
    const entry: Wish = { name: name.trim(), message: message.trim() || null, attendance };
    if (supabase && invitationId) {
      await supabase.from("rsvps").insert({
        invitation_id: invitationId,
        name: entry.name,
        attendance,
        guests_count: guests,
        message: entry.message,
      });
    }
    setWishes((w) => [entry, ...w]);
    setMessage("");
    setStatus("done");
  }

  return (
    <div className="mx-auto max-w-md">
      <form onSubmit={submit} className="space-y-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-brand-100">
        <input
          className="input"
          placeholder="Nama Anda"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="flex gap-2">
          <select className="input" value={attendance} onChange={(e) => setAttendance(e.target.value)}>
            <option value="hadir">Hadir</option>
            <option value="ragu">Ragu</option>
            <option value="tidak">Tidak Hadir</option>
          </select>
          <select className="input w-28" value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n} org</option>
            ))}
          </select>
        </div>
        <textarea
          className="input min-h-[80px]"
          placeholder="Ucapan & doa untuk kedua mempelai"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit" className="btn-primary w-full" disabled={status === "loading"}>
          {status === "loading" ? "Mengirim…" : "Kirim Ucapan"}
        </button>
        {status === "done" && (
          <p className="text-center text-sm text-green-600">Terima kasih atas ucapannya! 🤍</p>
        )}
        {isDemo && (
          <p className="text-center text-xs text-gray-400">
            (Mode demo — ucapan tidak tersimpan permanen)
          </p>
        )}
      </form>

      {wishes.length > 0 && (
        <div className="mt-6 space-y-3">
          {wishes.slice(0, 20).map((w, i) => (
            <div key={i} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-brand-50">
              <div className="flex items-center justify-between">
                <p className="font-medium text-brand-800">{w.name}</p>
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] text-brand-600">
                  {w.attendance === "hadir" ? "Hadir" : w.attendance === "ragu" ? "Ragu" : "Berhalangan"}
                </span>
              </div>
              {w.message && <p className="mt-1 text-sm text-gray-600">{w.message}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
