import type { InvitationView } from "./invitation-view";

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
  themeName: "Elegant Gold",
  songUrl: null,
  groom: {
    name: "Bimasena",
    fullName: "Bimasena Adiwangsa, S.T.",
    parents: "Putra dari Bapak Raden Suryanto & Ibu Larasati",
    instagram: "bimasena",
    photo: null,
  },
  bride: {
    name: "Andira",
    fullName: "Andira Kusuma Wardhani, S.Ked.",
    parents: "Putri dari Bapak Hendra Kusuma & Ibu Ratna Dewi",
    instagram: "andira.kw",
    photo: null,
  },
  mainDate: "2026-11-14",
  coupleTagline: "Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan pernikahan kami",
  hashtag: "#AndiraBerbima",
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
  gallery: [],
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
