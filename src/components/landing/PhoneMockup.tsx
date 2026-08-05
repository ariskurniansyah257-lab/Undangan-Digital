export default function PhoneMockup({
  groom = "Andira",
  bride = "Bimasena",
  date = "14 · 11 · 2026",
  accent = "from-[#4a2f2a] to-[#241715]",
  from,
  to,
  compact = false,
  className = "",
}: {
  groom?: string;
  bride?: string;
  date?: string;
  accent?: string;
  from?: string;
  to?: string;
  compact?: boolean;
  className?: string;
}) {
  const gradientStyle = from && to ? { backgroundImage: `linear-gradient(to bottom, ${from}, ${to})` } : undefined;
  const frameW = compact ? "w-[132px]" : "w-[210px]";
  const screenH = compact ? "h-[262px]" : "h-[420px]";
  const nameSize = compact ? "text-base" : "text-2xl";
  return (
    <div className={`relative ${className}`}>
      <div className={`mx-auto ${frameW} rounded-[2rem] border-[5px] border-gray-900 bg-gray-900 shadow-xl`}>
        <div className="relative overflow-hidden rounded-[1.5rem] bg-white">
          {/* notch */}
          <div className="absolute left-1/2 top-1.5 z-10 h-1.5 w-12 -translate-x-1/2 rounded-full bg-black/30" />
          <div
            style={gradientStyle}
            className={`flex ${screenH} flex-col items-center justify-center px-3 text-center ${gradientStyle ? "" : `bg-gradient-to-b ${accent}`}`}
          >
            <p className="text-[8px] uppercase tracking-[0.25em] text-gold-400">The Wedding Of</p>
            <h3 className={`mt-2 font-serif ${nameSize} leading-tight text-white`}>{groom}</h3>
            <span className="my-0.5 font-serif text-sm text-gold-400">&amp;</span>
            <h3 className={`font-serif ${nameSize} leading-tight text-white`}>{bride}</h3>
            <div className="my-3 h-px w-8 bg-gold-400/50" />
            <p className="text-[10px] text-white/70">{date}</p>
            <div className="mt-4 rounded-full bg-gold-500 px-3 py-1 text-[9px] font-semibold text-white">Buka Undangan</div>
          </div>
        </div>
      </div>
    </div>
  );
}
