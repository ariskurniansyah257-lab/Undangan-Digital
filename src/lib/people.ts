// Ilustrasi orang ORISINAL berbentuk siluet elegan, dengan animasi lembut
// (SMIL <animateTransform>) yang tetap jalan meski dipakai di <img>.
// Dipakai sebagai placeholder foto mempelai & galeri pada undangan demo.

function uri(svg: string): string {
  return "data:image/svg+xml," + encodeURIComponent(svg);
}

const breathe = `<animateTransform attributeName="transform" type="translate" values="0 0; 0 -7; 0 0" dur="4.5s" repeatCount="indefinite" additive="sum"/>`;
const sway = `<animateTransform attributeName="transform" type="rotate" values="-2 200 260; 2 200 260; -2 200 260" dur="6s" repeatCount="indefinite" additive="sum"/>`;

function scene(from: string, to: string, inner: string): string {
  return uri(
    `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'>` +
      `<defs><linearGradient id='b' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='${from}'/><stop offset='1' stop-color='${to}'/></linearGradient></defs>` +
      `<rect width='400' height='400' fill='url(#b)'/>` +
      inner +
      `</svg>`,
  );
}

// Siluet wanita (sanggul + kebaya) — potret dada.
export function woman(from = "#7a2438", to = "#c19a4f", skin = "#f7ede2"): string {
  const fig =
    `<g transform='translate(0,0)'>${breathe}${sway}` +
    `<path d='M92 400 Q200 250 308 400 Z' fill='${skin}' opacity='0.96'/>` + // bahu/kebaya
    `<path d='M150 400 Q200 300 250 400 Z' fill='#ffffff' opacity='0.5'/>` + // selendang
    `<rect x='188' y='210' width='24' height='46' rx='10' fill='${skin}'/>` + // leher
    `<circle cx='200' cy='176' r='56' fill='${skin}'/>` + // kepala
    `<path d='M144 176 a56 56 0 0 1 112 0 q-8 -46 -56 -46 q-48 0 -56 46 Z' fill='#3a2a22'/>` + // rambut
    `<circle cx='200' cy='120' r='22' fill='#3a2a22'/>` + // sanggul
    `<circle cx='176' cy='185' r='4' fill='#3a2a22'/><circle cx='224' cy='185' r='4' fill='#3a2a22'/>` + // mata
    `<path d='M188 205 q12 8 24 0' stroke='#b5675a' stroke-width='3' fill='none'/>` + // senyum
    `<circle cx='150' cy='150' r='6' fill='#ffd15a'/>` + // hiasan bunga
    `</g>`;
  return scene(from, to, fig);
}

// Siluet pria (jas + dasi) — potret dada.
export function man(from = "#3f4a37", to = "#a9a06b", skin = "#f0e0cf"): string {
  const fig =
    `<g transform='translate(0,0)'>${breathe}${sway}` +
    `<path d='M96 400 Q200 258 304 400 Z' fill='#2c2c33'/>` + // jas
    `<path d='M176 268 L200 400 L224 268 Z' fill='#ffffff' opacity='0.9'/>` + // kemeja
    `<path d='M193 268 L200 320 L207 268 Z' fill='${from}'/>` + // dasi
    `<rect x='188' y='214' width='24' height='44' rx='10' fill='${skin}'/>` + // leher
    `<circle cx='200' cy='180' r='54' fill='${skin}'/>` + // kepala
    `<path d='M148 168 q10 -40 52 -40 q42 0 52 40 q-16 -14 -52 -14 q-36 0 -52 14Z' fill='#241d16'/>` + // rambut
    `<circle cx='178' cy='186' r='4' fill='#241d16'/><circle cx='222' cy='186' r='4' fill='#241d16'/>` + // mata
    `<path d='M190 206 q10 7 20 0' stroke='#a86a52' stroke-width='3' fill='none'/>` + // senyum
    `</g>`;
  return scene(from, to, fig);
}

// Pasangan (untuk foto berdua / galeri).
export function couple(from = "#4a2f2a", to = "#c19a4f"): string {
  const hearts =
    `<g fill='#ffffff' opacity='0.85'>` +
    `<path d='M60 70 c-6 -7 -16 1 -8 9 l8 8 8 -8 c8 -8 -2 -16 -8 -9 Z'>` +
    `<animateTransform attributeName='transform' type='translate' values='0 0; 0 -12; 0 0' dur='5s' repeatCount='indefinite'/></path>` +
    `<path d='M330 90 c-5 -6 -14 1 -7 8 l7 7 7 -7 c7 -7 -2 -14 -7 -8 Z'>` +
    `<animateTransform attributeName='transform' type='translate' values='0 0; 0 -16; 0 0' dur='6s' repeatCount='indefinite'/></path>` +
    `</g>`;
  const w =
    `<g transform='translate(-52,20) scale(0.8)'>${breathe}` +
    `<path d='M92 400 Q200 260 308 400 Z' fill='#f7ede2'/>` +
    `<circle cx='200' cy='176' r='52' fill='#f7ede2'/>` +
    `<path d='M148 176 a52 52 0 0 1 104 0 q-8 -44 -52 -44 q-44 0 -52 44Z' fill='#3a2a22'/>` +
    `<circle cx='200' cy='124' r='20' fill='#3a2a22'/></g>`;
  const m =
    `<g transform='translate(58,24) scale(0.8)'>${breathe}` +
    `<path d='M96 400 Q200 266 304 400 Z' fill='#2c2c33'/>` +
    `<path d='M176 300 L200 400 L224 300 Z' fill='#ffffff' opacity='0.9'/>` +
    `<circle cx='200' cy='180' r='50' fill='#f0e0cf'/>` +
    `<path d='M150 170 q10 -38 50 -38 q40 0 50 38 q-16 -12 -50 -12 q-34 0 -50 12Z' fill='#241d16'/></g>`;
  return scene(from, to, hearts + w + m);
}
