"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { EVENT_TYPES } from "@/lib/constants";
import { VERSE_PRESETS, RELIGIONS } from "@/lib/verses";
import { CLOSING_PRESETS } from "@/lib/closings";
import ImageUpload from "@/components/ImageUpload";
import ImageField from "@/components/ImageField";
import type { Invitation, Song, Package } from "@/lib/types";

type Row = Record<string, any>;

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="card p-6">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {desc && <p className="mb-4 mt-0.5 text-sm text-gray-500">{desc}</p>}
      <div className={desc ? "" : "mt-4"}>{children}</div>
    </section>
  );
}

export default function InvitationEditor({
  invitation,
  initialEvents,
  initialBanks,
  initialStory,
  initialGallery,
  songs,
  pkg,
}: {
  invitation: Invitation;
  initialEvents: Row[];
  initialBanks: Row[];
  initialStory: Row[];
  initialGallery: Row[];
  songs: Song[];
  pkg: Package | null;
}) {
  const router = useRouter();
  const supabase = createClient();
  const id = invitation.id;
  const cfg = (invitation.config ?? {}) as Record<string, any>;

  const maxGallery = pkg?.max_gallery ?? 8;
  const maxEvents = pkg?.max_events ?? 3;
  const maxBanks = pkg?.max_banks ?? 6;
  const allowVideo = pkg?.allow_video ?? false;
  const allowSlide = pkg?.allow_auto_slide ?? false;

  // ---- scalar / config state ----
  const [title, setTitle] = useState(invitation.title);
  const [eventType, setEventType] = useState(invitation.event_type);
  const [status, setStatus] = useState(invitation.status);
  const [photoMode, setPhotoMode] = useState(invitation.photo_mode);
  const [quoteMode, setQuoteMode] = useState(invitation.quote_mode);
  const [religion, setReligion] = useState<string>(cfg.religion ?? "Islam");
  const [quoteText, setQuoteText] = useState(invitation.quote_text ?? "");
  const [quoteSource, setQuoteSource] = useState(invitation.quote_source ?? "");
  const [songId, setSongId] = useState(invitation.song_id ?? "");

  const [groom, setGroom] = useState<Row>(cfg.groom ?? { name: "", fullName: "", parents: "", instagram: "", photo: "" });
  const [bride, setBride] = useState<Row>(cfg.bride ?? { name: "", fullName: "", parents: "", instagram: "", photo: "" });
  const [mainDate, setMainDate] = useState(cfg.mainDate ?? "");
  const [coupleTagline, setCoupleTagline] = useState(cfg.coupleTagline ?? "");
  const [hashtag, setHashtag] = useState(cfg.hashtag ?? "");
  const [closingMessage, setClosingMessage] = useState(cfg.closingMessage ?? "");
  const [galleryMode, setGalleryMode] = useState(cfg.galleryMode ?? "normal");
  const [videoUrl, setVideoUrl] = useState(cfg.videoUrl ?? "");
  const [couplePhoto, setCouplePhoto] = useState(cfg.couplePhoto ?? "");

  // ---- child lists ----
  const [events, setEvents] = useState<Row[]>(initialEvents);
  const [banks, setBanks] = useState<Row[]>(initialBanks);
  const [story, setStory] = useState<Row[]>(initialStory);
  const [gallery, setGallery] = useState<Row[]>(initialGallery);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function saveMain() {
    setSaving(true);
    setMsg(null);
    const config = {
      ...cfg,
      groom, bride, mainDate, coupleTagline, hashtag, closingMessage,
      religion, galleryMode, videoUrl, couplePhoto,
    };
    const { error } = await supabase
      .from("invitations")
      .update({
        title: title.trim(),
        event_type: eventType,
        status,
        photo_mode: photoMode,
        quote_mode: quoteMode,
        quote_text: quoteText || null,
        quote_source: quoteSource || null,
        song_id: songId || null,
        config,
      })
      .eq("id", id);
    setSaving(false);
    setMsg(error ? `Gagal: ${error.message}` : "Tersimpan ✓");
    if (!error) router.refresh();
  }

  // ---- generic child helpers ----
  async function addChild(table: string, list: Row[], setList: (r: Row[]) => void, payload: Row, limit: number) {
    if (list.length >= limit) {
      setMsg(`Maksimum ${limit} item.`);
      return;
    }
    const { data, error } = await supabase
      .from(table)
      .insert({ invitation_id: id, sort_order: list.length, ...payload })
      .select("*")
      .single();
    if (error) return setMsg(`Gagal: ${error.message}`);
    setList([...list, data]);
  }
  async function updateChild(table: string, list: Row[], setList: (r: Row[]) => void, idx: number, patch: Row) {
    const row = { ...list[idx], ...patch };
    const next = [...list];
    next[idx] = row;
    setList(next);
    await supabase.from(table).update(patch).eq("id", row.id);
  }
  async function removeChild(table: string, list: Row[], setList: (r: Row[]) => void, idx: number) {
    const row = list[idx];
    setList(list.filter((_, i) => i !== idx));
    await supabase.from(table).delete().eq("id", row.id);
  }

  const input = "input";

  return (
    <div className="space-y-5 pb-24">
      {/* INFO DASAR */}
      <Section title="Info Dasar">
        <div className="space-y-4">
          <div>
            <label className="label">Judul undangan</label>
            <input className={input} value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="label">Jenis acara</label>
            <select className={input} value={eventType} onChange={(e) => setEventType(e.target.value as any)}>
              {EVENT_TYPES.map((e) => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
            <input
              type="checkbox"
              id="pub"
              checked={status === "published"}
              onChange={(e) => setStatus(e.target.checked ? "published" : "draft")}
              className="h-4 w-4"
            />
            <label htmlFor="pub" className="text-sm text-gray-700">
              Publikasikan undangan (bisa diakses publik di <code>/u/{invitation.slug}</code>)
            </label>
          </div>
        </div>
      </Section>

      {/* MEMPELAI */}
      <Section title="Mempelai" desc="Pilih tampilan foto: 1 foto gabung, foto terpisah, atau 3 foto (gabung + terpisah).">
        <div className="mb-4 flex flex-wrap gap-2">
          {([
            ["gabung", "1 Foto Gabung"],
            ["pisah", "Foto Terpisah"],
            ["tiga", "3 Foto (Gabung + Terpisah)"],
          ] as const).map(([m, lbl]) => (
            <button
              key={m}
              type="button"
              onClick={() => setPhotoMode(m)}
              className={`rounded-lg border px-4 py-2 text-sm ${
                photoMode === m ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-300 text-gray-600"
              }`}
            >
              {lbl}
            </button>
          ))}
        </div>
        {(photoMode === "gabung" || photoMode === "tiga") && (
          <div className="mb-4">
            <label className="label">Foto berdua (gabung)</label>
            <ImageField value={couplePhoto} onChange={setCouplePhoto} label="foto berdua" />
          </div>
        )}
        <div className="grid gap-6 sm:grid-cols-2">
          {([["Pria", groom, setGroom], ["Wanita", bride, setBride]] as const).map(([lbl, p, setP]) => (
            <div key={lbl} className="space-y-3 rounded-lg border border-gray-100 p-4">
              <p className="font-medium text-gray-700">Mempelai {lbl}</p>
              <input className={input} placeholder="Nama panggilan" value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} />
              <input className={input} placeholder="Nama lengkap" value={p.fullName} onChange={(e) => setP({ ...p, fullName: e.target.value })} />
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="mb-2 text-xs font-medium text-gray-500">
                  {lbl === "Pria" ? "Putra dari" : "Putri dari"}
                </p>
                <input className={input} placeholder="Nama ayah" value={p.fatherName ?? ""} onChange={(e) => setP({ ...p, fatherName: e.target.value })} />
                <input className={`${input} mt-2`} placeholder="Nama ibu" value={p.motherName ?? ""} onChange={(e) => setP({ ...p, motherName: e.target.value })} />
                <input className={`${input} mt-2`} placeholder={`Urutan anak (mis. ${lbl === "Pria" ? "Putra" : "Putri"} pertama) — opsional`} value={p.childOrder ?? ""} onChange={(e) => setP({ ...p, childOrder: e.target.value })} />
              </div>
              <input className={input} placeholder="Instagram (tanpa @)" value={p.instagram} onChange={(e) => setP({ ...p, instagram: e.target.value })} />
              {(photoMode === "pisah" || photoMode === "tiga") && (
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Foto mempelai {lbl.toLowerCase()}</label>
                  <ImageField value={p.photo} onChange={(url) => setP({ ...p, photo: url })} label="foto" />
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* TANGGAL & KUTIPAN */}
      <Section title="Tanggal & Kutipan">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Tanggal utama (untuk hitung mundur)</label>
              <input type="date" className={input} value={mainDate} onChange={(e) => setMainDate(e.target.value)} />
            </div>
            <div>
              <label className="label">Tagar / hashtag</label>
              <input className={input} value={hashtag} onChange={(e) => setHashtag(e.target.value)} placeholder="#NamaKami" />
            </div>
          </div>
          <div>
            <label className="label">Kalimat pembuka</label>
            <input className={input} value={coupleTagline} onChange={(e) => setCoupleTagline(e.target.value)} placeholder="Dengan memohon rahmat Tuhan..." />
          </div>

          <div className="rounded-lg border border-gray-100 p-4">
            <div className="mb-3 flex gap-2">
              {(["ayat", "custom"] as const).map((m) => (
                <button key={m} type="button" onClick={() => setQuoteMode(m)}
                  className={`rounded-lg border px-4 py-2 text-sm ${quoteMode === m ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-300 text-gray-600"}`}>
                  {m === "ayat" ? "Ayat / Kitab Suci" : "Kata-kata Custom"}
                </button>
              ))}
            </div>
            {quoteMode === "ayat" && (
              <div className="mb-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label">Agama</label>
                  <select className={input} value={religion} onChange={(e) => setReligion(e.target.value)}>
                    {RELIGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Pilih preset</label>
                  <select
                    className={input}
                    onChange={(e) => {
                      const p = VERSE_PRESETS[religion]?.[Number(e.target.value)];
                      if (p) { setQuoteText(p.text); setQuoteSource(p.source); }
                    }}
                  >
                    <option value="">— Pilih ayat —</option>
                    {(VERSE_PRESETS[religion] ?? []).map((p, i) => (
                      <option key={i} value={i}>{p.source}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            <textarea className={`${input} min-h-[90px]`} value={quoteText} onChange={(e) => setQuoteText(e.target.value)} placeholder="Teks kutipan" />
            <input className={`${input} mt-2`} value={quoteSource} onChange={(e) => setQuoteSource(e.target.value)} placeholder="Sumber (mis. Q.S. Ar-Rum : 21)" />
          </div>

          <div>
            <label className="label">Pesan penutup</label>
            <select
              className={`${input} mb-2`}
              value=""
              onChange={(e) => { if (e.target.value) setClosingMessage(e.target.value); }}
            >
              <option value="">— Pilih preset kata penutup (bisa diedit) —</option>
              {CLOSING_PRESETS.map((c, i) => (
                <option key={i} value={c}>{c.slice(0, 60)}…</option>
              ))}
            </select>
            <textarea className={`${input} min-h-[70px]`} value={closingMessage} onChange={(e) => setClosingMessage(e.target.value)} placeholder="Tulis atau pilih preset kata penutup di atas" />
          </div>
        </div>
      </Section>

      {/* RANGKAIAN ACARA */}
      <Section title="Rangkaian Acara" desc={`Minimal 1, maksimal ${maxEvents} acara. Tiap acara punya lokasi sendiri.`}>
        <div className="space-y-4">
          {events.map((ev, i) => (
            <div key={ev.id} className="space-y-2 rounded-lg border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">Acara {i + 1}</p>
                <button onClick={() => removeChild("invitation_events", events, setEvents, i)} className="text-sm text-red-500">Hapus</button>
              </div>
              <input className={input} placeholder="Nama acara (mis. Akad Nikah)" value={ev.name ?? ""} onChange={(e) => updateChild("invitation_events", events, setEvents, i, { name: e.target.value })} />
              <div className="grid grid-cols-3 gap-2">
                <input type="date" className={input} value={ev.event_date ?? ""} onChange={(e) => updateChild("invitation_events", events, setEvents, i, { event_date: e.target.value })} />
                <input type="time" className={input} value={ev.start_time ?? ""} onChange={(e) => updateChild("invitation_events", events, setEvents, i, { start_time: e.target.value })} />
                <input type="time" className={input} value={ev.end_time ?? ""} onChange={(e) => updateChild("invitation_events", events, setEvents, i, { end_time: e.target.value })} />
              </div>
              <input className={input} placeholder="Nama lokasi" value={ev.location_name ?? ""} onChange={(e) => updateChild("invitation_events", events, setEvents, i, { location_name: e.target.value })} />
              <input className={input} placeholder="Alamat" value={ev.location_address ?? ""} onChange={(e) => updateChild("invitation_events", events, setEvents, i, { location_address: e.target.value })} />
              <input className={input} placeholder="Link Google Maps" value={ev.map_url ?? ""} onChange={(e) => updateChild("invitation_events", events, setEvents, i, { map_url: e.target.value })} />
            </div>
          ))}
          {events.length < maxEvents && (
            <button onClick={() => addChild("invitation_events", events, setEvents, { name: "Acara Baru" }, maxEvents)} className="btn-outline w-full">
              + Tambah Acara
            </button>
          )}
        </div>
      </Section>

      {/* AMPLOP DIGITAL */}
      <Section title="Amplop Digital (Gift)" desc={`Maksimal ${maxBanks} rekening.`}>
        <div className="space-y-3">
          {banks.map((b, i) => (
            <div key={b.id} className="grid gap-2 rounded-lg border border-gray-100 p-3 sm:grid-cols-4">
              <input className={input} placeholder="Bank" value={b.bank_name ?? ""} onChange={(e) => updateChild("invitation_banks", banks, setBanks, i, { bank_name: e.target.value })} />
              <input className={input} placeholder="No. Rekening" value={b.account_number ?? ""} onChange={(e) => updateChild("invitation_banks", banks, setBanks, i, { account_number: e.target.value })} />
              <input className={input} placeholder="Atas nama" value={b.account_name ?? ""} onChange={(e) => updateChild("invitation_banks", banks, setBanks, i, { account_name: e.target.value })} />
              <button onClick={() => removeChild("invitation_banks", banks, setBanks, i)} className="text-sm text-red-500">Hapus</button>
            </div>
          ))}
          {banks.length < maxBanks && (
            <button onClick={() => addChild("invitation_banks", banks, setBanks, { bank_name: "", account_number: "", account_name: "" }, maxBanks)} className="btn-outline w-full">
              + Tambah Bank
            </button>
          )}
        </div>
      </Section>

      {/* OUR JOURNEY */}
      <Section title="Our Journey" desc="Cerita perjalanan (seperti rangkaian, ada judul & cerita).">
        <div className="space-y-3">
          {story.map((s, i) => (
            <div key={s.id} className="space-y-2 rounded-lg border border-gray-100 p-3">
              <div className="flex items-center justify-between">
                <input className={`${input} mr-2`} placeholder="Judul" value={s.title ?? ""} onChange={(e) => updateChild("invitation_story", story, setStory, i, { title: e.target.value })} />
                <button onClick={() => removeChild("invitation_story", story, setStory, i)} className="text-sm text-red-500">Hapus</button>
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Bulan & tahun</label>
                <input
                  type="month"
                  className={input}
                  value={(s.story_date ?? "").slice(0, 7)}
                  onChange={(e) =>
                    updateChild("invitation_story", story, setStory, i, {
                      story_date: e.target.value ? `${e.target.value}-01` : null,
                    })
                  }
                />
              </div>
              <textarea className={`${input} min-h-[70px]`} placeholder="Cerita" value={s.story ?? ""} onChange={(e) => updateChild("invitation_story", story, setStory, i, { story: e.target.value })} />
            </div>
          ))}
          <button onClick={() => addChild("invitation_story", story, setStory, { title: "Momen Baru" }, 20)} className="btn-outline w-full">
            + Tambah Cerita
          </button>
        </div>
      </Section>

      {/* GALERI */}
      <Section title="Galeri Foto" desc={`Maksimal ${maxGallery} foto (masukkan URL foto).`}>
        {allowSlide && (
          <div className="mb-4 flex gap-2">
            {(["normal", "slide"] as const).map((m) => (
              <button key={m} type="button" onClick={() => setGalleryMode(m)}
                className={`rounded-lg border px-4 py-2 text-sm ${galleryMode === m ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-300 text-gray-600"}`}>
                {m === "normal" ? "Grid Biasa" : "Geser Otomatis"}
              </button>
            ))}
          </div>
        )}
        <div className="space-y-2">
          {gallery.map((g, i) => (
            <div key={g.id} className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 p-2">
              <ImageField
                value={g.image_url}
                onChange={(url) => updateChild("invitation_gallery", gallery, setGallery, i, { image_url: url })}
                label={`foto ${i + 1}`}
              />
              <button onClick={() => removeChild("invitation_gallery", gallery, setGallery, i)} className="text-sm text-red-500">Hapus</button>
            </div>
          ))}
          {gallery.length < maxGallery && (
            <button onClick={() => addChild("invitation_gallery", gallery, setGallery, { image_url: "" }, maxGallery)} className="btn-outline w-full">
              + Tambah Foto ({gallery.length}/{maxGallery})
            </button>
          )}
        </div>
      </Section>

      {/* VIDEO (Luxury/Motion) */}
      {allowVideo && (
        <Section title="Video" desc="Tersedia untuk paket Luxury & Motion.">
          <div className="flex gap-2">
            <input className={input} placeholder="URL video (YouTube/MP4)" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
            <ImageUpload label="Video" accept="video/*" onUploaded={setVideoUrl} />
          </div>
        </Section>
      )}

      {/* LAGU */}
      <Section title="Lagu Latar" desc="Pilih dari daftar yang disediakan admin.">
        {songs.length === 0 ? (
          <p className="text-sm text-gray-400">Belum ada lagu tersedia dari admin.</p>
        ) : (
          <select className={input} value={songId} onChange={(e) => setSongId(e.target.value)}>
            <option value="">— Tanpa lagu —</option>
            {songs.map((s) => (
              <option key={s.id} value={s.id}>{s.title}{s.artist ? ` — ${s.artist}` : ""}</option>
            ))}
          </select>
        )}
      </Section>

      {/* SAVE BAR */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/95 p-3 backdrop-blur md:pl-64">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-1">
          <span className={`text-sm ${msg?.startsWith("Gagal") ? "text-red-600" : "text-green-600"}`}>{msg}</span>
          <button onClick={saveMain} className="btn-primary" disabled={saving}>
            {saving ? "Menyimpan…" : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </div>
  );
}
