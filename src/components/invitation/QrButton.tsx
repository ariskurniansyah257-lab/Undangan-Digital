"use client";

import { useState } from "react";
import QRCode from "qrcode";

/** Tombol QR melayang: menampilkan QR dari URL undangan saat ini. */
export default function QrButton({ accent }: { accent: string }) {
  const [open, setOpen] = useState(false);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [pageUrl, setPageUrl] = useState("");

  async function show() {
    const url = window.location.href;
    setPageUrl(url);
    try {
      const d = await QRCode.toDataURL(url, { width: 260, margin: 1 });
      setDataUrl(d);
    } catch {
      setDataUrl(null);
    }
    setOpen(true);
  }

  return (
    <>
      <button
        onClick={show}
        className="fixed bottom-36 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full text-white shadow-lg"
        style={{ background: accent }}
        aria-label="Tampilkan QR undangan"
      >
        <span className="text-lg">🔳</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-6"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-xs rounded-2xl bg-white p-6 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-serif text-lg text-gray-900">Scan Undangan</h3>
            <p className="mt-1 text-xs text-gray-500">
              Arahkan kamera untuk membuka undangan ini.
            </p>
            {dataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={dataUrl} alt="QR undangan" className="mx-auto mt-4 h-56 w-56" />
            ) : (
              <p className="mt-6 text-sm text-gray-400">QR tidak tersedia.</p>
            )}
            <p className="mt-3 break-all text-[11px] text-gray-400">{pageUrl}</p>
            <button
              onClick={() => setOpen(false)}
              className="mt-4 rounded-lg px-5 py-2 text-sm font-medium text-white"
              style={{ background: accent }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
}
