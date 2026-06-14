import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { birthdayConfig } from "../data/birthdayConfig";

type SoundState = {
  playing: boolean;
  available: boolean;
  /** Toggle mute on/off. */
  mute: () => void;
  /** Play a short, synthesised cue at meaningful interaction moments. */
  cue: (type: CueType) => void;
};

type CueType = "page" | "sparkle" | "pop" | "whoosh" | "chime";

const SoundCtx = createContext<SoundState | null>(null);

/* ---- A soft, romantic music-box rendition of "Happy Birthday" -------------
   The melody is public domain. We synthesise it with WebAudio so the page
   has gentle default background music with no audio file required. If you drop
   a real track at /public/audio/soundtrack.mp3 it is played instead.        */
const N: Record<string, number> = {
  G4: 392.0, A4: 440.0, B4: 493.88, C5: 523.25,
  D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99,
};
// [note, beats]; null = rest
const MELODY: [string | null, number][] = [
  ["G4", 0.5], ["G4", 0.5], ["A4", 1], ["G4", 1], ["C5", 1], ["B4", 2],
  ["G4", 0.5], ["G4", 0.5], ["A4", 1], ["G4", 1], ["D5", 1], ["C5", 2],
  ["G4", 0.5], ["G4", 0.5], ["G5", 1], ["E5", 1], ["C5", 1], ["B4", 1], ["A4", 2],
  ["F5", 0.5], ["F5", 0.5], ["E5", 1], ["C5", 1], ["D5", 1], ["C5", 2],
  [null, 2],
];
const SEC_PER_BEAT = 0.5;

export function SoundProvider({ children }: { children: React.ReactNode }) {
  // Synth music box is always available; an mp3 file is optional.
  const available = true;
  const fileSrc = birthdayConfig.soundtrack;

  const [muted, setMuted] = useState(false);
  const playing = !muted;

  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const loopTimer = useRef<number | null>(null);
  const fileAudioRef = useRef<HTMLAudioElement | null>(null);
  const usingFileRef = useRef(false);
  const startedRef = useRef(false);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      ctxRef.current = new AC();
      const master = ctxRef.current.createGain();
      master.gain.value = 0.0001;
      master.connect(ctxRef.current.destination);
      masterRef.current = master;
    }
    return ctxRef.current;
  }, []);

  // Schedule one pass of the melody and queue the next.
  const scheduleMelody = useCallback(() => {
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master) return;
    let t = ctx.currentTime + 0.05;
    for (const [note, beats] of MELODY) {
      const dur = beats * SEC_PER_BEAT;
      if (note) {
        const freq = N[note];
        // a warm pair of voices for a music-box feel
        [1, 2].forEach((mult, i) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = i === 0 ? "triangle" : "sine";
          osc.frequency.value = freq * mult;
          const peak = i === 0 ? 1 : 0.25;
          g.gain.setValueAtTime(0.0001, t);
          g.gain.exponentialRampToValueAtTime(peak, t + 0.04);
          g.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.9);
          osc.connect(g).connect(master);
          osc.start(t);
          osc.stop(t + dur);
        });
      }
      t += dur;
    }
    const total = (t - ctx.currentTime) * 1000;
    loopTimer.current = window.setTimeout(scheduleMelody, total);
  }, []);

  const fade = useCallback((target: number, ms = 1000) => {
    const master = masterRef.current;
    const ctx = ctxRef.current;
    if (!master || !ctx) return;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(
      Math.max(0.0001, target),
      ctx.currentTime + ms / 1000
    );
  }, []);

  // Start the music (called on the first user gesture).
  const start = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    // Prefer a real audio file if present; fall back to the synth melody.
    if (fileSrc) {
      const el = new Audio(fileSrc);
      el.loop = true;
      el.volume = 0;
      let ok = true;
      el.addEventListener("error", () => {
        ok = false;
        if (!usingFileRef.current) {
          getCtx();
          scheduleMelody();
          fade(0.16);
        }
      });
      el.play()
        .then(() => {
          if (!ok) return;
          usingFileRef.current = true;
          fileAudioRef.current = el;
          // fade the file in
          const t0 = performance.now();
          const step = (now: number) => {
            const p = Math.min(1, (now - t0) / 1200);
            el.volume = 0.5 * p;
            if (p < 1 && !muted) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        })
        .catch(() => {
          // file blocked/missing -> synth
          getCtx();
          scheduleMelody();
          fade(0.16);
        });
    } else {
      getCtx();
      scheduleMelody();
      fade(0.16);
    }
  }, [fileSrc, getCtx, scheduleMelody, fade, muted]);

  // Unlock + start on the very first interaction (autoplay policy).
  useEffect(() => {
    const unlock = () => start();
    const opts = { once: true, passive: true } as const;
    window.addEventListener("pointerdown", unlock, opts);
    window.addEventListener("touchstart", unlock, opts);
    window.addEventListener("keydown", unlock, opts);
    window.addEventListener("scroll", unlock, opts);
    window.addEventListener("wheel", unlock, opts);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("scroll", unlock);
      window.removeEventListener("wheel", unlock);
    };
  }, [start]);

  // React to mute changes.
  useEffect(() => {
    if (!startedRef.current) return;
    if (usingFileRef.current && fileAudioRef.current) {
      const el = fileAudioRef.current;
      if (muted) el.pause();
      else el.play().catch(() => {});
    } else if (ctxRef.current) {
      if (muted) fade(0.0001, 400);
      else fade(0.16, 800);
    }
  }, [muted, fade]);

  // Pause when the tab is hidden; resume when it returns (if not muted).
  useEffect(() => {
    const onVis = () => {
      if (usingFileRef.current && fileAudioRef.current) {
        if (document.hidden) fileAudioRef.current.pause();
        else if (!muted) fileAudioRef.current.play().catch(() => {});
      } else if (ctxRef.current) {
        if (document.hidden) ctxRef.current.suspend();
        else if (!muted) ctxRef.current.resume();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [muted]);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      if (loopTimer.current) window.clearTimeout(loopTimer.current);
      fileAudioRef.current?.pause();
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  // Tiny interaction cues (only when not muted).
  const cue = useCallback(
    (type: CueType) => {
      if (muted) return;
      try {
        const ctx = getCtx();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const map: Record<CueType, { f: number; type: OscillatorType }> = {
          page: { f: 320, type: "triangle" },
          sparkle: { f: 1200, type: "sine" },
          pop: { f: 180, type: "square" },
          whoosh: { f: 90, type: "sawtooth" },
          chime: { f: 880, type: "sine" },
        };
        const { f, type: wave } = map[type];
        osc.type = wave;
        osc.frequency.setValueAtTime(f, now);
        if (type === "sparkle" || type === "chime")
          osc.frequency.exponentialRampToValueAtTime(f * 1.5, now + 0.12);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.1, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      } catch {
        /* ignore */
      }
    },
    [muted, getCtx]
  );

  const mute = useCallback(() => setMuted((m) => !m), []);

  const value = useMemo<SoundState>(
    () => ({ playing, available, mute, cue }),
    [playing, available, mute, cue]
  );

  return <SoundCtx.Provider value={value}>{children}</SoundCtx.Provider>;
}

export function useSound(): SoundState {
  const ctx = useContext(SoundCtx);
  if (!ctx) throw new Error("useSound must be used within <SoundProvider>");
  return ctx;
}
