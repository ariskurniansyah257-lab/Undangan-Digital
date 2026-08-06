"use client";

import type { SupabaseClient } from "@supabase/supabase-js";

/** Kompres gambar di browser → data URI JPEG (fallback tanpa Storage). */
export function compressImageToDataUrl(
  file: File,
  maxDim = 1280,
  quality = 0.72,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas tidak tersedia."));
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Gagal memuat gambar."));
    };
    img.src = url;
  });
}

/**
 * Upload gambar: coba Supabase Storage dulu; bila gagal (bucket/policy belum
 * siap), fallback ke data URI terkompresi agar upload selalu berhasil.
 * Untuk video, hanya Storage (tidak ada fallback data URI).
 */
export async function uploadImage(
  supabase: SupabaseClient,
  file: File,
  bucket = "invitations",
): Promise<{ url: string; viaStorage: boolean }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const safe = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const path = `${user?.id ?? "anon"}/${Date.now()}-${safe}`;
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true, contentType: file.type });
    if (!error) {
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      return { url: data.publicUrl, viaStorage: true };
    }
  } catch {
    /* lanjut ke fallback */
  }

  if (file.type.startsWith("image/")) {
    const dataUrl = await compressImageToDataUrl(file);
    return { url: dataUrl, viaStorage: false };
  }

  // Fallback audio/video tanpa Storage: simpan sebagai data URI bila ukurannya
  // masih wajar (agar upload lagu tetap berhasil meski bucket belum dibuat).
  const MAX_FALLBACK = 9 * 1024 * 1024; // ~9 MB
  if (file.size <= MAX_FALLBACK) {
    const dataUrl = await fileToDataUrl(file);
    return { url: dataUrl, viaStorage: false };
  }
  throw new Error(
    `File terlalu besar (${(file.size / 1048576).toFixed(1)} MB) untuk mode tanpa Storage (maks 9 MB). ` +
      "Aktifkan bucket 'invitations' di Supabase untuk file besar, atau pilih file lebih kecil.",
  );
}

/** Baca file apa pun menjadi data URI (fallback tanpa Storage). */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(new Error("Gagal membaca file."));
    r.readAsDataURL(file);
  });
}
