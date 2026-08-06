"use client";

/**
 * Musik latar generatif memakai Web Audio API — nada ambient lembut yang
 * dibangkitkan real-time, bebas hak cipta (bukan berkas lagu apa pun).
 */
export interface MusicController {
  start: () => Promise<void>;
  stop: () => void;
  dispose: () => void;
}

export function createGenerativeMusic(): MusicController | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || (window as any).webkitAudioContext;
  if (!AC) return null;

  const ctx: AudioContext = new AC();
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  // Skala mayor pentatonik (terdengar lembut & harmonis).
  const scale = [0, 2, 4, 7, 9, 12, 14, 16];
  const base = 220; // A3
  let step = 0;
  let timer: ReturnType<typeof setInterval> | null = null;

  function pluck(freq: number, at: number, dur: number, vol: number) {
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(vol, at + 0.06);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(g);
    g.connect(master);
    o.start(at);
    o.stop(at + dur + 0.05);
  }

  function schedule() {
    const now = ctx.currentTime;
    const semis = scale[step % scale.length];
    const freq = base * Math.pow(2, semis / 12);
    pluck(freq, now, 1.4, 0.22);
    if (step % 4 === 0) pluck(freq / 2, now, 1.8, 0.14); // bass sesekali
    step++;
  }

  return {
    async start() {
      try { await ctx.resume(); } catch { /* ignore */ }
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 1.2);
      if (!timer) {
        schedule();
        timer = setInterval(schedule, 640);
      }
    },
    stop() {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
      if (timer) { clearInterval(timer); timer = null; }
    },
    dispose() {
      if (timer) clearInterval(timer);
      ctx.close().catch(() => {});
    },
  };
}
