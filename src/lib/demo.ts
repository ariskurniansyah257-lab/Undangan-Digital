import type { InvitationView } from "./invitation-view";

// Placeholder gambar berbasis SVG (data-URI) agar demo selalu tampil tanpa
// bergantung host eksternal. Konten orisinal.
function svgImg(w: number, h: number, c1: string, c2: string, label: string): string {
  const fs = Math.round(Math.min(w, h) / 3.2);
  const s =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'>` +
    `<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>` +
    `<stop offset='0' stop-color='${c1}'/><stop offset='1' stop-color='${c2}'/></linearGradient></defs>` +
    `<rect width='100%' height='100%' fill='url(#g)'/>` +
    `<circle cx='${w * 0.82}' cy='${h * 0.18}' r='${Math.min(w, h) * 0.06}' fill='rgba(255,255,255,0.18)'/>` +
    `<text x='50%' y='52%' font-family='Georgia,serif' font-size='${fs}' fill='rgba(255,255,255,0.85)' text-anchor='middle' dominant-baseline='middle'>${label}</text>` +
    `</svg>`;
  return "data:image/svg+xml," + encodeURIComponent(s);
}

const G = (l: string, a = "#4a2f2a", b = "#c19a4f") => svgImg(400, 400, a, b, l);

// Undangan demo — dipakai di /u/demo untuk memperlihatkan hasil akhir
// tanpa perlu data dari editor. Semua konten fiktif & orisinal.
export const DEMO_INVITATION: InvitationView = {
  id: null,
  slug: "demo",
  eventType: "wedding",
  title: "Andira & Bimasena",
  status: "published",
  quoteText:
    "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.",
  quoteSource: "Q.S. Ar-Rum : 21",
  photoMode: "pisah",
  themeName: "Artistik Ornamen",
  themeSlug: "premium-artistik",
  songUrl: null,
  groom: {
    name: "Bimasena",
    fullName: "Bimasena Adiwangsa, S.T.",
    parents: "Putra dari Bapak Raden Suryanto & Ibu Larasati",
    instagram: "bimasena",
    photo: svgImg(400, 500, "#3f4a37", "#a9a06b", "B"),
  },
  bride: {
    name: "Andira",
    fullName: "Andira Kusuma Wardhani, S.Ked.",
    parents: "Putri dari Bapak Hendra Kusuma & Ibu Ratna Dewi",
    instagram: "andira.kw",
    photo: svgImg(400, 500, "#7a2438", "#c19a4f", "A"),
  },
  mainDate: "2026-11-14",
  coupleTagline: "Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan pernikahan kami",
  hashtag: "#AndiraBerbima",
  couplePhoto: svgImg(800, 500, "#4a2f2a", "#c19a4f", "A & B"),
  galleryMode: "slide",
  videoUrl: null,
  closingMessage:
    "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu.",
  events: [
    {
      name: "Akad Nikah",
      date: "2026-11-14",
      startTime: "08:00",
      endTime: "10:00",
      locationName: "Masjid Agung Al-Falah",
      locationAddress: "Jl. Sudirman No. 45, Jakarta Pusat",
      mapUrl: "https://maps.google.com/?q=Masjid+Agung+Al-Falah+Jakarta",
    },
    {
      name: "Resepsi",
      date: "2026-11-14",
      startTime: "11:00",
      endTime: "14:00",
      locationName: "Ballroom Puri Ratna",
      locationAddress: "Jl. Gatot Subroto No. 12, Jakarta Selatan",
      mapUrl: "https://maps.google.com/?q=Puri+Ratna+Jakarta",
    },
  ],
  banks: [
    { bankName: "Bank BCA", accountNumber: "1234567890", accountName: "Andira Kusuma Wardhani" },
    { bankName: "Bank Mandiri", accountNumber: "0987654321", accountName: "Bimasena Adiwangsa" },
  ],
  gallery: [
    { imageUrl: svgImg(500, 500, "#4a2f2a", "#c19a4f", "❀"), caption: null },
    { imageUrl: svgImg(500, 500, "#7a2438", "#d4af6a", "♥"), caption: null },
    { imageUrl: svgImg(500, 500, "#3f4a37", "#a9a06b", "❀"), caption: null },
    { imageUrl: svgImg(500, 500, "#1e3a5f", "#c9a86a", "♥"), caption: null },
    { imageUrl: svgImg(500, 500, "#5a1e2a", "#d4a35a", "❀"), caption: null },
    { imageUrl: svgImg(500, 500, "#2a2444", "#d9a3c9", "♥"), caption: null },
  ],
  story: [
    {
      title: "Pertama Bertemu",
      story:
        "Kami dipertemukan di sebuah acara relawan sosial pada 2021. Perkenalan sederhana yang tak disangka menjadi awal dari segalanya.",
      storyDate: "2021-03-01",
    },
    {
      title: "Mulai Dekat",
      story:
        "Kesamaan visi dan banyaknya obrolan hangat membuat kami semakin dekat, saling menguatkan dalam suka dan duka.",
      storyDate: "2022-08-01",
    },
    {
      title: "Lamaran",
      story:
        "Pada penghujung 2025, dengan restu kedua keluarga, kami melangkah ke jenjang yang lebih serius melalui prosesi lamaran.",
      storyDate: "2025-12-20",
    },
  ],
};
