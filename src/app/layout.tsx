import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Undangan Digital — Platform Undangan untuk Setiap Momen",
  description:
    "Buat undangan digital untuk pernikahan, aqiqah, khitanan, ulang tahun, hingga seminar. Pilih tema, atur acara, kelola tamu, dan bagikan tautan personal.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
