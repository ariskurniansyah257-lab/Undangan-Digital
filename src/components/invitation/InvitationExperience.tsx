"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getTheme } from "@/lib/themes";
import { createGenerativeMusic, type MusicController } from "@/lib/music";
import { OrnamentPattern, OrnamentCorner } from "./Ornament";
import AddToCartButton from "@/components/AddToCartButton";
import type { InvitationView } from "@/lib/invitation-view";

const MONTHS = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const DAYS = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];

function formatDateID(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return iso;
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function useCountdown(targetIso: string | null) {
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!targetIso) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const target = new Date(targetIso + "T00:00:00").getTime();
  const diff = Math.max(0, target - now);
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function hexToRgba(hex: string, a: number): string {
  const m = hex.replace("#", "");
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-6 text-center font-serif text-2xl text-[color:var(--accent)] sm:text-3xl">{children}</h2>;
}

export default function InvitationExperience({
  data,
  guestName,
  themeSlug,
  previewMode = false,
  orderItem,
}: {
  data: InvitationView;
  guestName: string;
  themeSlug?: string | null;
  previewMode?: boolean;
  orderItem?: { type: "package"; refId: string; name: string; price: number };
}) {
  const theme = getTheme(themeSlug);
  const tintBg = hexToRgba(theme.vars.tint, 0.5);
  const [opened, setOpened] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const genRef = useRef<MusicController | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [activeId, setActiveId] = useState("hero");
  const cd = useCountdown(data.mainDate);

  useEffect(() => {
    document.body.style.overflow = opened ? "" : "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [opened]);

  // Bersihkan musik generatif saat unmount.
  useEffect(() => () => genRef.current?.dispose(), []);

  // Lacak slide aktif untuk indikator titik & highlight bottom-nav.
  useEffect(() => {
    const root = scrollRef.current;
    if (!root || !opened) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            if (e.target.id) setActiveId(e.target.id);
            e.target.classList.add("in-view");
          } else {
            e.target.classList.remove("in-view");
          }
        });
      },
      { root, threshold: 0.55 },
    );
    root.querySelectorAll("section[id]").forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, [opened]);

  async function startMusic() {
    if (data.songUrl && audioRef.current) {
      await audioRef.current.play().catch(() => {});
    } else {
      if (!genRef.current) genRef.current = createGenerativeMusic();
      await genRef.current?.start();
    }
    setPlaying(true);
  }
  function stopMusic() {
    if (data.songUrl) audioRef.current?.pause();
    else genRef.current?.stop();
    setPlaying(false);
  }

  function handleOpen() {
    setOpened(true);
    startMusic();
    window.scrollTo({ top: 0 });
  }
  function toggleMusic() {
    if (playing) stopMusic();
    else startMusic();
  }
  function jump(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const navItems = [
    { id: "hero", icon: "🏠", label: "Home" },
    { id: "mempelai", icon: "💑", label: "Mempelai" },
    { id: "acara", icon: "📅", label: "Acara" },
    ...(data.gallery.length ? [{ id: "galeri", icon: "🖼️", label: "Galeri" }] : []),
    ...(data.banks.length ? [{ id: "gift", icon: "🎁", label: "Gift" }] : []),
    { id: "rsvp", icon: "✉️", label: "RSVP" },
  ];

  const slides = [
    "hero",
    ...(data.quoteText ? ["quote"] : []),
    "mempelai",
    "acara",
    ...(data.story.length ? ["journey"] : []),
    ...(data.gallery.length ? ["galeri"] : []),
    ...(data.videoUrl ? ["video"] : []),
    ...(data.banks.length ? ["gift"] : []),
    "rsvp",
    "closing",
  ];

  const cssVars = {
    ["--accent" as any]: theme.vars.accent,
    ["--heading" as any]: theme.vars.heading,
    ["--tint" as any]: theme.vars.tint,
    ["--body" as any]: theme.vars.body,
  } as React.CSSProperties;

  return (
    <div
      className="relative mx-auto min-h-screen max-w-lg overflow-hidden bg-[var(--body)] text-gray-700 shadow-2xl"
      style={cssVars}
    >
      <OrnamentPattern
        type={theme.ornament}
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full text-[color:var(--heading)] opacity-[0.13]"
      />
      {data.songUrl && <audio ref={audioRef} src={data.songUrl} loop preload="auto" />}

      {previewMode && (
        <div className="sticky top-0 z-[60] flex items-center justify-between gap-2 bg-black/80 px-4 py-2 text-white backdrop-blur">
          <span className="text-xs">Mode Preview · Tema {theme.name}</span>
          {orderItem && (
            <AddToCartButton item={orderItem} goToCart label="Pesan Tema Ini" className="rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-semibold text-white" />
          )}
        </div>
      )}

      {/* COVER */}
      <div
        className={`fixed inset-0 z-50 mx-auto flex max-w-lg flex-col items-center justify-center px-8 text-center transition-all duration-700 ${opened ? "pointer-events-none -translate-y-full opacity-0" : "opacity-100"}`}
        style={{ background: `linear-gradient(rgba(0,0,0,0.4),rgba(0,0,0,0.6)), linear-gradient(160deg, ${theme.vars.coverFrom}, ${theme.vars.coverTo})` }}
      >
        <OrnamentPattern type={theme.ornament} className="pointer-events-none absolute inset-0 text-[color:var(--accent)] opacity-[0.16]" />
        <div className="pointer-events-none absolute inset-4 rounded-2xl border opacity-30" style={{ borderColor: theme.vars.accent }} />
        <OrnamentCorner type={theme.ornament} className="absolute left-2 top-2 h-28 w-28 text-[color:var(--accent)]" />
        <OrnamentCorner type={theme.ornament} className="absolute bottom-2 right-2 h-28 w-28 rotate-180 text-[color:var(--accent)]" />
        <div className="relative z-10 flex flex-col items-center">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[color:var(--accent)]">The Wedding Of</p>
          <h1 className="font-serif text-4xl text-white sm:text-5xl">{data.groom.name} &amp; {data.bride.name}</h1>
          <div className="my-6 h-px w-16" style={{ background: theme.vars.accent, opacity: 0.6 }} />
          <p className="text-sm text-white/70">Kepada Yth. Bapak/Ibu/Saudara/i</p>
          <p className="mt-2 rounded-lg bg-white/10 px-5 py-2 font-serif text-xl text-white backdrop-blur">{guestName}</p>
          <button onClick={handleOpen} className="mt-10 inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105" style={{ background: theme.vars.accent }}>
            ✉️ Buka Undangan
          </button>
        </div>
      </div>

      {/* MUSIK */}
      {opened && (
        <button onClick={toggleMusic} className="fixed bottom-20 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full text-white shadow-lg" style={{ background: theme.vars.accent }} aria-label="Musik">
          <span className={playing ? "animate-spin-slow" : ""}>{playing ? "♫" : "▶"}</span>
        </button>
      )}

      {/* ISI — mode slide: tiap section satu layar, snap ke berikutnya */}
      <div
        ref={scrollRef}
        className={`snap-slides h-[100dvh] overflow-y-scroll transition-opacity duration-500 ${
          opened ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <section id="hero" className="relative flex min-h-screen flex-col items-center justify-center px-6 py-20 text-center">
          <OrnamentCorner type={theme.ornament} className="absolute left-0 top-0 h-24 w-24 text-[color:var(--accent)] opacity-50" />
          <OrnamentCorner type={theme.ornament} className="absolute bottom-0 right-0 h-24 w-24 rotate-180 text-[color:var(--accent)] opacity-50" />
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--accent)]">The Wedding Of</p>
          <h1 className="mt-4 font-serif text-5xl text-[color:var(--heading)]">{data.groom.name}</h1>
          <p className="my-2 font-serif text-2xl text-[color:var(--accent)]">&amp;</p>
          <h1 className="font-serif text-5xl text-[color:var(--heading)]">{data.bride.name}</h1>
          <p className="mt-6 text-sm text-gray-500">{formatDateID(data.mainDate)}</p>
          <div className="mt-8 flex gap-3">
            {[{ v: cd.days, l: "Hari" }, { v: cd.hours, l: "Jam" }, { v: cd.minutes, l: "Menit" }, { v: cd.seconds, l: "Detik" }].map((c) => (
              <div key={c.l} className="flex w-16 flex-col rounded-xl bg-white/80 py-3 shadow-sm ring-1 ring-black/5">
                <span className="font-serif text-2xl text-[color:var(--heading)]">{c.v}</span>
                <span className="text-[11px] text-gray-400">{c.l}</span>
              </div>
            ))}
          </div>
        </section>

        {data.quoteText && (
          <section id="quote" className="px-8 py-16 text-center" style={{ backgroundColor: tintBg }}>
            <p className="mx-auto max-w-md font-serif text-lg italic leading-relaxed text-gray-600">&ldquo;{data.quoteText}&rdquo;</p>
            {data.quoteSource && <p className="mt-4 text-sm font-semibold text-[color:var(--accent)]">({data.quoteSource})</p>}
          </section>
        )}

        <section id="mempelai" className="px-6 py-16">
          <SectionTitle>Mempelai</SectionTitle>
          <p className="mb-10 text-center text-sm text-gray-500">{data.coupleTagline}</p>
          {data.photoMode === "gabung" && data.couplePhoto && (
            <div className="mx-auto mb-10 w-full max-w-sm overflow-hidden rounded-2xl shadow ring-4 ring-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={data.couplePhoto} alt="Kedua mempelai" className="kenburns w-full object-cover" />
            </div>
          )}
          <div className="relative">
            <div className="grid grid-cols-2 gap-3 sm:gap-5">
              {[data.groom, data.bride].map((p, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  {p.photo ? (
                    <div className="w-full overflow-hidden rounded-2xl shadow ring-2 ring-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.photo} alt={p.name} className="aspect-[4/5] w-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex aspect-[4/5] w-full items-center justify-center rounded-2xl font-serif text-4xl text-white shadow ring-2 ring-white" style={{ background: theme.vars.accent }}>
                      {p.name.charAt(0)}
                    </div>
                  )}
                  <h3 className="mt-3 font-serif text-lg leading-tight text-[color:var(--heading)]">{p.fullName || p.name}</h3>
                  {p.parents && <p className="mt-1.5 text-xs leading-snug text-gray-500">{p.parents}</p>}
                  {p.instagram && <a href={`https://instagram.com/${p.instagram}`} className="mt-1.5 text-xs text-[color:var(--accent)]">@{p.instagram}</a>}
                </div>
              ))}
            </div>
            <span
              className="absolute left-1/2 top-[30%] flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white font-serif text-2xl shadow ring-1 ring-black/5"
              style={{ color: theme.vars.accent }}
            >
              &amp;
            </span>
          </div>
        </section>

        <section id="acara" className="px-6 py-16" style={{ backgroundColor: tintBg }}>
          <SectionTitle>Rangkaian Acara</SectionTitle>
          <div className="space-y-6">
            {data.events.map((ev, i) => (
              <div key={i} className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-black/5">
                <h3 className="font-serif text-xl text-[color:var(--heading)]">{ev.name}</h3>
                <p className="mt-2 text-sm text-gray-600">{formatDateID(ev.date)}</p>
                {(ev.startTime || ev.endTime) && <p className="text-sm text-gray-600">{ev.startTime}{ev.endTime ? ` – ${ev.endTime}` : ""} WIB</p>}
                {ev.locationName && <p className="mt-2 font-medium text-gray-800">{ev.locationName}</p>}
                {ev.locationAddress && <p className="text-sm text-gray-500">{ev.locationAddress}</p>}
                {ev.mapUrl && <a href={ev.mapUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-full px-5 py-2 text-sm font-medium text-white" style={{ background: theme.vars.heading }}>📍 Lihat Lokasi</a>}
              </div>
            ))}
          </div>
        </section>

        {data.story.length > 0 && (
          <section id="journey" className="px-6 py-16">
            <SectionTitle>Our Journey</SectionTitle>
            <div className="relative ml-3 space-y-8 border-l-2 border-black/10 pl-6">
              {data.story.map((s, i) => (
                <div key={i} className="relative">
                  <span className="absolute -left-[31px] top-1 h-4 w-4 rounded-full ring-4 ring-white" style={{ background: theme.vars.accent }} />
                  <h3 className="font-serif text-lg text-[color:var(--heading)]">{s.title}</h3>
                  {s.storyDate && <p className="text-xs text-[color:var(--accent)]">{formatDateID(s.storyDate)}</p>}
                  {s.story && <p className="mt-1 text-sm leading-relaxed text-gray-600">{s.story}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {data.gallery.length > 0 && (
          <section id="galeri" className="overflow-hidden py-16" style={{ backgroundColor: tintBg }}>
            <div className="px-6"><SectionTitle>Galeri</SectionTitle></div>
            {data.galleryMode === "slide" ? (
              <div className="relative w-full overflow-hidden">
                <div className="gallery-marquee px-3">
                  {[...data.gallery, ...data.gallery].map((g, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={g.imageUrl} alt={g.caption ?? ""} className="h-56 w-40 flex-none rounded-xl object-cover" />
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 px-6">
                {data.gallery.map((g, i) => (
                  <div key={i} className="aspect-square overflow-hidden rounded-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={g.imageUrl} alt={g.caption ?? ""} className="kenburns h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {data.videoUrl && (
          <section id="video" className="px-6 py-16">
            <SectionTitle>Video</SectionTitle>
            {/youtube|youtu\.be/.test(data.videoUrl) ? (
              <div className="aspect-video w-full overflow-hidden rounded-xl">
                <iframe className="h-full w-full" src={data.videoUrl.replace("watch?v=", "embed/").replace("youtu.be/", "www.youtube.com/embed/")} title="Video" allowFullScreen />
              </div>
            ) : (
              <video src={data.videoUrl} controls className="w-full rounded-xl" />
            )}
          </section>
        )}

        {data.banks.length > 0 && (
          <section id="gift" className="px-6 py-16">
            <SectionTitle>Amplop Digital</SectionTitle>
            <p className="mb-8 text-center text-sm text-gray-500">Doa restu Anda karunia terindah. Bila berkenan memberi tanda kasih:</p>
            <div className="space-y-4">{data.banks.map((b, i) => <GiftCard key={i} bank={b} heading={theme.vars.heading} />)}</div>
          </section>
        )}

        <section id="rsvp" className="px-6 py-16" style={{ backgroundColor: tintBg }}>
          <SectionTitle>Konfirmasi Kehadiran</SectionTitle>
          <RSVPBlock invitationId={previewMode ? null : data.id} defaultName={guestName} accent={theme.vars.accent} />
        </section>

        <section id="closing" className="px-6 py-20 pb-28 text-center">
          <p className="mx-auto max-w-md text-sm leading-relaxed text-gray-600">{data.closingMessage}</p>
          <div className="my-8 mx-auto h-px w-16" style={{ background: theme.vars.accent, opacity: 0.6 }} />
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--accent)]">Wassalam</p>
          <h2 className="mt-3 font-serif text-3xl text-[color:var(--heading)]">{data.groom.name} &amp; {data.bride.name}</h2>
          {data.hashtag && <p className="mt-4 text-sm font-semibold text-[color:var(--accent)]">{data.hashtag}</p>}
          <p className="mt-10 text-xs text-gray-400">Undangan digital oleh <a href="/" className="text-[color:var(--accent)]">Undangan Digital</a></p>
        </section>
      </div>

      {/* INDIKATOR TITIK SLIDE (kanan) */}
      {opened && (
        <div className="fixed right-2.5 top-1/2 z-40 flex -translate-y-1/2 flex-col items-center gap-2">
          {slides.map((id) => (
            <button
              key={id}
              onClick={() => jump(id)}
              aria-label={`Ke bagian ${id}`}
              className="rounded-full transition-all duration-300"
              style={{
                width: activeId === id ? 10 : 7,
                height: activeId === id ? 10 : 7,
                background: activeId === id ? theme.vars.accent : "rgba(0,0,0,0.18)",
              }}
            />
          ))}
        </div>
      )}

      {/* BOTTOM NAV */}
      {opened && (
        <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-lg border-t border-black/10 bg-white/95 px-2 py-1.5 backdrop-blur">
          <div className="flex items-center justify-around">
            {navItems.map((n) => {
              const on = activeId === n.id;
              return (
                <button
                  key={n.id}
                  onClick={() => jump(n.id)}
                  className="flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1 transition-colors"
                  style={{ color: on ? theme.vars.heading : "#9ca3af" }}
                >
                  <span className={`text-lg leading-none transition-transform ${on ? "scale-125" : ""}`}>{n.icon}</span>
                  <span className="text-[10px] font-medium">{n.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}

function GiftCard({ bank, heading }: { bank: { bankName: string; accountNumber: string; accountName: string }; heading: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-2xl p-5 text-white shadow-md" style={{ background: `linear-gradient(135deg, ${heading}, ${heading}dd)` }}>
      <p className="text-sm opacity-80">{bank.bankName}</p>
      <p className="mt-2 font-mono text-xl tracking-wider">{bank.accountNumber}</p>
      <p className="mt-1 text-sm opacity-90">a.n. {bank.accountName}</p>
      <button onClick={() => { navigator.clipboard?.writeText(bank.accountNumber); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="mt-3 rounded-full bg-white/20 px-4 py-1.5 text-xs font-medium backdrop-blur">
        {copied ? "✓ Tersalin" : "Salin No. Rekening"}
      </button>
    </div>
  );
}

interface Wish { name: string; message: string | null; attendance: string; }

function RSVPBlock({ invitationId, defaultName, accent }: { invitationId: string | null; defaultName: string; accent: string }) {
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
    supabase.from("rsvps").select("name, message, attendance").eq("invitation_id", invitationId).order("created_at", { ascending: false }).limit(50).then(({ data }) => setWishes((data as Wish[]) ?? []));
  }, [supabase, invitationId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setStatus("loading");
    const entry: Wish = { name: name.trim(), message: message.trim() || null, attendance };
    if (supabase && invitationId) {
      await supabase.from("rsvps").insert({ invitation_id: invitationId, name: entry.name, attendance, guests_count: guests, message: entry.message });
    }
    setWishes((w) => [entry, ...w]);
    setMessage("");
    setStatus("done");
  }

  return (
    <div className="mx-auto max-w-md">
      <form onSubmit={submit} className="space-y-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
        <input className="input" placeholder="Nama Anda" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="flex gap-2">
          <select className="input" value={attendance} onChange={(e) => setAttendance(e.target.value)}>
            <option value="hadir">Hadir</option><option value="ragu">Ragu</option><option value="tidak">Tidak Hadir</option>
          </select>
          <select className="input w-28" value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
            {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} org</option>)}
          </select>
        </div>
        <textarea className="input min-h-[80px]" placeholder="Ucapan & doa untuk kedua mempelai" value={message} onChange={(e) => setMessage(e.target.value)} />
        <button type="submit" className="w-full rounded-lg py-2.5 text-sm font-medium text-white" style={{ background: accent }} disabled={status === "loading"}>
          {status === "loading" ? "Mengirim…" : "Kirim Ucapan"}
        </button>
        {status === "done" && <p className="text-center text-sm text-green-600">Terima kasih atas ucapannya! 🤍</p>}
        {isDemo && <p className="text-center text-xs text-gray-400">(Mode preview — ucapan tidak tersimpan)</p>}
      </form>
      {wishes.length > 0 && (
        <div className="mt-6 space-y-3">
          {wishes.slice(0, 3).map((w, i) => (
            <div key={i} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5">
              <div className="flex items-center justify-between">
                <p className="font-medium text-[color:var(--heading)]">{w.name}</p>
                <span className="rounded-full bg-black/5 px-2 py-0.5 text-[11px] text-gray-600">{w.attendance === "hadir" ? "Hadir" : w.attendance === "ragu" ? "Ragu" : "Berhalangan"}</span>
              </div>
              {w.message && <p className="mt-1 text-sm text-gray-600">{w.message}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
