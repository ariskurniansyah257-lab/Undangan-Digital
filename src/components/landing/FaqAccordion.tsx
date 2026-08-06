"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "Apa itu undangan digital?",
    a: "Undangan digital adalah undangan berbentuk halaman web yang bisa dibagikan lewat WhatsApp, Instagram, atau media sosial lain. Tamu cukup membuka tautan untuk melihat detail acara, konfirmasi kehadiran, dan mengirim ucapan.",
  },
  {
    q: "Untuk acara apa saja bisa dipakai?",
    a: "Pernikahan, aqiqah, khitanan, ulang tahun, hingga seminar atau sidang skripsi. Setiap jenis acara punya penyesuaian konten tersendiri.",
  },
  {
    q: "Apakah setiap tamu mendapat nama sendiri?",
    a: "Ya. Anda bisa membuat daftar tamu (hingga 1000) dan sistem otomatis membuat tautan personal untuk tiap tamu, sehingga nama mereka tampil di halaman sampul.",
  },
  {
    q: "Bagaimana cara pembayaran?",
    a: "Pilih paket, lakukan checkout, lalu transfer ke rekening yang tersedia dan unggah bukti bayar. Admin akan memverifikasi dan mengaktifkan undangan Anda.",
  },
  {
    q: "Apakah bisa ganti lagu dan tema?",
    a: "Bisa. Tersedia beragam tema sesuai paket (Basic, Premium, Luxury, Motion) dan pilihan lagu latar yang dapat Anda tentukan sendiri.",
  },
];

export default function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mx-auto max-w-2xl divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white">
      {FAQS.map((f, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between px-5 py-4 text-left"
          >
            <span className="font-medium text-gray-800">{f.q}</span>
            <span className="text-brand-500">{open === i ? "−" : "+"}</span>
          </button>
          {open === i && (
            <p className="px-5 pb-4 text-sm leading-relaxed text-gray-600">{f.a}</p>
          )}
        </div>
      ))}
    </div>
  );
}
