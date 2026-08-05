export default function PhoneMockup({
  groom = "Andira",
  bride = "Bimasena",
  date = "14 · 11 · 2026",
  accent = "from-[#4a2f2a] to-[#241715]",
  from,
  to,
  className = "",
}: {
  groom?: string;
  bride?: string;
  date?: string;
  accent?: string;
  from?: string;
  to?: string;
  className?: string;
}) {
  const gradientStyle = from && to ? { backgroundImage: `linear-gradient(to bottom, ${from}, ${to})` } : undefined;
  return (
    <div className={`relative ${className}`}>
      <div className="mx-auto w-[210px] rounded-[2.2rem] border-[6px] border-gray-900 bg-gray-900 shadow-2xl">
        <div className="relative overflow-hidden rounded-[1.7rem] bg-white">
          {/* notch */}
          <div className="absolute left-1/2 top-2 z-10 h-1.5 w-16 -translate-x-1/2 rounded-full bg-black/30" />
          <div
            style={gradientStyle}
            className={`flex h-[420px] flex-col items-center justify-center px-5 text-center ${gradientStyle ? "" : `bg-gradient-to-b ${accent}`}`}
          >
            <p className="text-[9px] uppercase tracking-[0.25em] text-gold-400">
              The Wedding Of
            </p>
            <h3 className="mt-3 font-serif text-2xl leading-tight text-white">
              {groom}
            </h3>
            <span className="my-1 font-serif text-lg text-gold-400">&amp;</span>
            <h3 className="font-serif text-2xl leading-tight text-white">{bride}</h3>
            <div className="my-4 h-px w-10 bg-gold-400/50" />
            <p className="text-[11px] text-white/70">{date}</p>
            <div className="mt-6 rounded-full bg-gold-500 px-4 py-1.5 text-[10px] font-semibold text-white">
              Buka Undangan
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
