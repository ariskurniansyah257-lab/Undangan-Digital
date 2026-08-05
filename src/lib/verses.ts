// Preset kutipan pembuka per agama untuk mempermudah klien.
// Semua bisa diganti/di-custom. Teks sengaja singkat & umum; klien
// dianjurkan menyesuaikan sesuai keyakinan masing-masing.

export interface VersePreset {
  text: string;
  source: string;
}

export const VERSE_PRESETS: Record<string, VersePreset[]> = {
  Islam: [
    {
      text: "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.",
      source: "Q.S. Ar-Rum : 21",
    },
    {
      text: "Dan segala sesuatu Kami ciptakan berpasang-pasangan agar kamu mengingat (kebesaran Allah).",
      source: "Q.S. Adz-Dzariyat : 49",
    },
  ],
  Kristen: [
    {
      text: "Demikianlah mereka bukan lagi dua, melainkan satu. Karena itu, apa yang telah dipersatukan Allah, tidak boleh diceraikan manusia.",
      source: "Matius 19 : 6",
    },
    {
      text: "Kasih itu sabar; kasih itu murah hati; ia tidak cemburu. Ia tidak memegahkan diri dan tidak sombong.",
      source: "1 Korintus 13 : 4",
    },
  ],
  Katolik: [
    {
      text: "Sebab itu laki-laki akan meninggalkan ayah dan ibunya dan bersatu dengan istrinya, sehingga keduanya menjadi satu.",
      source: "Kejadian 2 : 24",
    },
  ],
  Hindu: [
    {
      text: "Semoga pasangan ini senantiasa hidup rukun, berbahagia, dan diberkati dalam ikatan suci pernikahan.",
      source: "Kitab Wiwaha Samskara",
    },
  ],
  Buddha: [
    {
      text: "Semoga kedua mempelai senantiasa dilimpahi cinta kasih, kebijaksanaan, dan kebahagiaan sejati.",
      source: "Karaniya Metta Sutta",
    },
  ],
  Konghucu: [
    {
      text: "Pernikahan adalah penyatuan dua keluarga dalam keharmonisan, kebajikan, dan saling menghormati.",
      source: "Kitab Li Ji",
    },
  ],
};

export const RELIGIONS = Object.keys(VERSE_PRESETS);
