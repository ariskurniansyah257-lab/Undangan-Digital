// Login/daftar via email ATAU nomor HP tanpa perlu penyedia SMS.
// Nomor HP dipetakan ke "email sintetis" sehingga tetap memakai auth
// email+password bawaan Supabase. Nomor asli tetap disimpan di profiles.phone.

const PHONE_EMAIL_DOMAIN = "phone.undangan.app";

/** Normalisasi nomor HP Indonesia → hanya digit, awalan 62. */
export function normalizePhone(v: string): string {
  let s = v.trim().replace(/[\s\-().]/g, "");
  if (s.startsWith("+")) s = s.slice(1);
  s = s.replace(/\D/g, "");
  if (s.startsWith("0")) s = "62" + s.slice(1);
  return s;
}

/** Email sintetis dari nomor HP (untuk Supabase auth). */
export function phoneToEmail(phone: string): string {
  return `${normalizePhone(phone)}@${PHONE_EMAIL_DOMAIN}`;
}

/** Apakah string ini email (mengandung '@') atau nomor HP. */
export function looksLikeEmail(v: string): boolean {
  return v.includes("@");
}

/** Ubah input identitas (email atau HP) menjadi email untuk auth. */
export function identityToEmail(input: string): string {
  const s = input.trim();
  return looksLikeEmail(s) ? s : phoneToEmail(s);
}
