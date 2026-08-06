"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  resolveTheme,
  ANIMATIONS,
  TEMPLATE_SLIDES,
  type OrnamentType,
  type AnimationType,
  type Sticker,
  type SlideOverride,
} from "@/lib/themes";
import ImageField from "@/components/ImageField";
import { StickerVisual, stickerBoxStyle } from "@/components/invitation/Sticker";
import type { Theme } from "@/lib/types";

const ORNAMENTS: OrnamentType[] = ["jawa", "padang", "ceria", "modern", "artistik"];

function newId() {
  return `st_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Editor template penuh (mirip Canva): buka layar penuh, pilih halaman,
 * tempel ornamen manual (drag posisi, atur ukuran/putar), dan setel transisi
 * masing-masing ornamen.
 */
export default function TemplateFullEditor({
  theme,
  onClose,
  onSaved,
}: {
  theme: Theme;
  onClose: () => void;
  onSaved: (config: Record<string, unknown>) => void;
}) {
  const supabase = createClient();
  const eff = resolveTheme(theme.slug, theme.config);
  const baseConfig = (theme.config ?? {}) as Record<string, unknown>;

  const [slides, setSlides] = useState<Record<string, SlideOverride>>(
    JSON.parse(JSON.stringify(eff.slides ?? {})),
  );
  const [page, setPage] = useState<string>("mempelai");
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const drag = useRef<{ id: string } | null>(null);

  const stickers: Sticker[] = slides[page]?.stickers ?? [];
  const selSticker = stickers.find((s) => s.id === selected) ?? null;

  function setStickers(next: Sticker[]) {
    setSlides((s) => ({ ...s, [page]: { ...(s[page] ?? {}), stickers: next } }));
  }
  function addSticker(st: Sticker) {
    setStickers([...stickers, st]);
    setSelected(st.id);
  }
  function patchSticker(id: string, patch: Partial<Sticker>) {
    setStickers(stickers.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }
  function removeSticker(id: string) {
    setStickers(stickers.filter((s) => s.id !== id));
    if (selected === id) setSelected(null);
  }

  // Drag posisi ornamen (persen relatif kanvas).
  function onPointerDownSticker(e: React.PointerEvent, id: string) {
    e.preventDefault();
    setSelected(id);
    drag.current = { id };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current || !canvasRef.current) return;
    const r = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100));
    patchSticker(drag.current.id, { x: Math.round(x), y: Math.round(y) });
  }
  function onPointerUp() {
    drag.current = null;
  }

  async function save() {
    setSaving(true);
    const config = { ...baseConfig, slides };
    const { error } = await supabase.from("themes").update({ config }).eq("id", theme.id);
    setSaving(false);
    if (!error) {
      onSaved(config);
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-[90] flex flex-col bg-gray-900 text-white">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">Editor Template — {theme.name}</p>
          <p className="truncate text-[11px] text-white/50">Tempel ornamen & atur transisi per halaman</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={save} disabled={saving} className="rounded-lg bg-brand-600 px-4 py-1.5 text-sm font-medium">
            {saving ? "Menyimpan…" : "Simpan"}
          </button>
          <button onClick={onClose} className="rounded-lg bg-white/10 px-3 py-1.5 text-sm">✕ Tutup</button>
        </div>
      </div>

      {/* Pemilih halaman */}
      <div className="flex gap-2 overflow-x-auto border-b border-white/10 px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TEMPLATE_SLIDES.map((sl) => (
          <button
            key={sl.id}
            onClick={() => { setPage(sl.id); setSelected(null); }}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
              page === sl.id ? "bg-brand-600 text-white" : "bg-white/10 text-white/70"
            }`}
          >
            {sl.label}
            {(slides[sl.id]?.stickers?.length ?? 0) > 0 && (
              <span className="ml-1.5 rounded-full bg-white/25 px-1.5 text-[10px]">
                {slides[sl.id]!.stickers!.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto md:flex-row md:overflow-hidden">
        {/* Kanvas */}
        <div className="flex items-center justify-center p-4 md:flex-1 md:overflow-auto">
          <div
            ref={canvasRef}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            onClick={(e) => { if (e.target === canvasRef.current) setSelected(null); }}
            className="relative overflow-hidden rounded-[1.75rem] border-4 border-black shadow-2xl"
            style={{
              width: 300,
              height: 620,
              maxWidth: "90vw",
              background: `linear-gradient(160deg, ${eff.vars.coverFrom}, ${eff.vars.coverTo})`,
            }}
          >
            <div className="pointer-events-none absolute left-1/2 top-2 z-10 h-1.5 w-14 -translate-x-1/2 rounded-full bg-white/30" />
            <p className="pointer-events-none absolute inset-x-0 top-8 text-center text-[11px] uppercase tracking-widest text-white/40">
              {TEMPLATE_SLIDES.find((s) => s.id === page)?.label}
            </p>
            {stickers.map((s) => (
              <div
                key={s.id}
                onPointerDown={(e) => onPointerDownSticker(e, s.id)}
                className={`absolute cursor-move touch-none ${selected === s.id ? "ring-2 ring-brand-400" : ""}`}
                style={{ ...stickerBoxStyle(s), color: eff.vars.accent }}
              >
                <StickerVisual s={s} />
              </div>
            ))}
            {stickers.length === 0 && (
              <p className="pointer-events-none absolute inset-x-4 bottom-1/2 text-center text-xs text-white/50">
                Tambahkan ornamen dari panel kanan, lalu geser untuk memposisikan.
              </p>
            )}
          </div>
        </div>

        {/* Panel kontrol */}
        <div className="w-full shrink-0 space-y-4 border-t border-white/10 bg-gray-950 p-4 text-sm md:w-72 md:overflow-y-auto md:border-l md:border-t-0">
          <div>
            <p className="mb-2 font-medium">Tambah ornamen bawaan</p>
            <div className="grid grid-cols-3 gap-2">
              {ORNAMENTS.map((o) => (
                <button
                  key={o}
                  onClick={() => addSticker({ id: newId(), kind: "ornament", ornament: o, x: 50, y: 50, size: 28, rotation: 0, opacity: 0.6 })}
                  className="rounded-lg bg-white/10 px-2 py-2 text-[11px] capitalize hover:bg-white/20"
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 font-medium">Unggah gambar ornamen</p>
            <ImageField
              value=""
              label="gambar"
              onChange={(url) => { if (url) addSticker({ id: newId(), kind: "image", src: url, x: 50, y: 50, size: 40, rotation: 0, opacity: 1 }); }}
            />
          </div>

          <hr className="border-white/10" />

          {selSticker ? (
            <div className="space-y-3">
              <p className="font-medium">Ornamen terpilih</p>
              <label className="block text-xs text-white/60">
                Ukuran ({selSticker.size}%)
                <input type="range" min={5} max={90} value={selSticker.size}
                  onChange={(e) => patchSticker(selSticker.id, { size: Number(e.target.value) })}
                  className="mt-1 w-full" />
              </label>
              <label className="block text-xs text-white/60">
                Putar ({selSticker.rotation ?? 0}°)
                <input type="range" min={-180} max={180} value={selSticker.rotation ?? 0}
                  onChange={(e) => patchSticker(selSticker.id, { rotation: Number(e.target.value) })}
                  className="mt-1 w-full" />
              </label>
              <label className="block text-xs text-white/60">
                Transparansi ({Math.round((selSticker.opacity ?? 1) * 100)}%)
                <input type="range" min={10} max={100} value={Math.round((selSticker.opacity ?? 1) * 100)}
                  onChange={(e) => patchSticker(selSticker.id, { opacity: Number(e.target.value) / 100 })}
                  className="mt-1 w-full" />
              </label>
              <label className="block text-xs text-white/60">
                Transisi masuk ornamen ini
                <select
                  className="mt-1 w-full rounded-lg bg-white/10 px-2 py-1.5 text-white"
                  value={selSticker.animation ?? ""}
                  onChange={(e) => patchSticker(selSticker.id, { animation: (e.target.value || undefined) as AnimationType | undefined })}
                >
                  <option value="">— ikuti halaman —</option>
                  {ANIMATIONS.map((a) => <option key={a.value} value={a.value} className="text-black">{a.label}</option>)}
                </select>
              </label>
              <button onClick={() => removeSticker(selSticker.id)} className="w-full rounded-lg bg-red-600/80 py-1.5 text-xs">
                Hapus ornamen
              </button>
            </div>
          ) : (
            <p className="text-xs text-white/40">Pilih (klik) ornamen di kanvas untuk mengatur ukuran, rotasi, transparansi, dan transisinya.</p>
          )}
        </div>
      </div>
    </div>
  );
}
