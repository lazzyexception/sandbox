import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useSound } from "../context/SoundContext";

/**
 * The cake + candles. Two ways to blow them out, both accessible:
 *   • press-and-hold the "Make a wish" button (also works with Enter/Space)
 *   • optionally, the microphone — but ONLY after the visitor explicitly asks
 *     for it and the browser grants permission. The hold button is always there.
 * Flames bend while you "blow", then go out one by one. When the last goes out,
 * onComplete fires (the finale takes over).
 */
export function CandleInteraction({
  candleCount = 5,
  onComplete,
}: {
  candleCount?: number;
  onComplete: () => void;
}) {
  const reduced = useReducedMotion();
  const { playing, cue } = useSound();
  const [lit, setLit] = useState<boolean[]>(() =>
    Array.from({ length: candleCount }, () => true)
  );
  const [blowing, setBlowing] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const progress = useRef(0);
  const raf = useRef(0);
  const done = useRef(false);
  const micCleanup = useRef<() => void>(() => {});

  const litCount = lit.filter(Boolean).length;

  // Extinguish candles as "blow progress" climbs from 0 → 1.
  const applyProgress = (p: number) => {
    progress.current = Math.min(1, Math.max(0, p));
    const shouldBeLit = Math.ceil(candleCount * (1 - progress.current));
    setLit((prev) => {
      let changed = false;
      const next = prev.map((on, i) => {
        const nowOn = i < shouldBeLit;
        if (on && !nowOn) changed = true;
        return nowOn;
      });
      if (changed && playing) cue("whoosh");
      return next;
    });
    if (progress.current >= 1 && !done.current) {
      done.current = true;
      stopBlow();
      stopMic();
      window.setTimeout(onComplete, 700);
    }
  };

  // --- Press and hold --------------------------------------------------------
  const startBlow = () => {
    if (done.current) return;
    setBlowing(true);
    const step = () => {
      applyProgress(progress.current + (reduced ? 0.06 : 0.012));
      if (progress.current < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  };
  const stopBlow = () => {
    setBlowing(false);
    cancelAnimationFrame(raf.current);
  };

  // --- Microphone (opt-in) ---------------------------------------------------
  const startMic = async () => {
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const actx = new AC();
      const src = actx.createMediaStreamSource(stream);
      const analyser = actx.createAnalyser();
      analyser.fftSize = 512;
      src.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      setMicOn(true);
      setBlowing(true);

      const loop = () => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / data.length);
        // Sustained breath/noise nudges progress forward.
        if (rms > 0.12) applyProgress(progress.current + rms * 0.05);
        if (!done.current) raf.current = requestAnimationFrame(loop);
      };
      raf.current = requestAnimationFrame(loop);

      micCleanup.current = () => {
        cancelAnimationFrame(raf.current);
        stream.getTracks().forEach((t) => t.stop());
        actx.close().catch(() => {});
        setMicOn(false);
        setBlowing(false);
      };
    } catch {
      setMicError("Microphone unavailable — use the wish button instead.");
    }
  };
  const stopMic = () => micCleanup.current();

  useEffect(() => {
    return () => {
      cancelAnimationFrame(raf.current);
      micCleanup.current();
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Cake */}
      <div className="relative" aria-hidden="true">
        {/* candles */}
        <div className="absolute -top-16 left-1/2 flex -translate-x-1/2 gap-3">
          {lit.map((on, i) => (
            <div key={i} className="flex flex-col items-center">
              <span
                className={`mb-1 block h-5 w-3 origin-bottom rounded-t-full transition-all duration-300 ${
                  on
                    ? `bg-gradient-to-t from-pink via-sunflower to-ivory ${
                        blowing && !reduced ? "skew-x-12 scale-y-75" : ""
                      } ${!reduced ? "animate-flicker" : ""}`
                    : "scale-0 opacity-0"
                }`}
              />
              <span className="h-12 w-2 rounded-sm bg-pink" />
            </div>
          ))}
        </div>
        {/* tiers */}
        <div className="h-16 w-56 rounded-t-xl bg-ivory shadow-paper" />
        <div className="-mt-1 h-2 w-56 bg-sunflower" />
        <div className="h-20 w-64 -translate-x-1 rounded-b-xl bg-lavender shadow-paper" />
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          disabled={litCount === 0}
          onPointerDown={startBlow}
          onPointerUp={stopBlow}
          onPointerLeave={stopBlow}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !e.repeat) {
              e.preventDefault();
              startBlow();
            }
          }}
          onKeyUp={(e) => {
            if (e.key === "Enter" || e.key === " ") stopBlow();
          }}
          className="select-none rounded-full bg-sunflower px-10 py-4 font-condensed text-2xl tracking-[0.15em] text-ink shadow-paper transition-transform active:scale-95 disabled:opacity-50"
        >
          {litCount === 0 ? "✨ WISH MADE ✨" : "PRESS & HOLD TO MAKE A WISH"}
        </button>

        {/* Progress ribbon */}
        <div className="h-2 w-64 overflow-hidden rounded-full bg-ivory/30">
          <div
            className="h-full bg-pink transition-[width] duration-100"
            style={{ width: `${(1 - litCount / candleCount) * 100}%` }}
          />
        </div>

        {!micOn && litCount > 0 && (
          <button
            type="button"
            onClick={startMic}
            className="font-condensed text-sm tracking-[0.2em] text-lavender underline-offset-4 hover:underline"
          >
            …or blow into your microphone
          </button>
        )}
        {micOn && (
          <p className="font-hand text-xl text-sunflower">
            Now blow! 🌬️
          </p>
        )}
        {micError && (
          <p role="status" className="font-sans text-sm text-ivory/80">
            {micError}
          </p>
        )}
      </div>
    </div>
  );
}
