import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useSound } from "../context/SoundContext";
import { Confetti } from "../lib/confetti";
import { birthdayConfig } from "../data/birthdayConfig";
import { PaperPhoto } from "./PaperPhoto";
import { Star } from "./Doodles";

/**
 * Section 9 — the finale. Revealed only after the wish is made. Candle smoke
 * resolves into a drawn heart, photographs drift up behind, controlled bursts
 * of confetti fire (a few times, then stop — never an endless particle storm),
 * and the biggest shared photo settles in the centre with the creator's
 * signature. Two closing actions: replay the whole story, or keep a printable
 * memory card. Sharing stays off unless enabled in config.
 */
export function FinalCelebration({
  visible,
  onReplay,
}: {
  visible: boolean;
  onReplay: () => void;
}) {
  const reduced = useReducedMotion();
  const { playing, cue } = useSound();
  const cfg = birthdayConfig;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const confetti = useRef<Confetti | null>(null);
  const [showCard, setShowCard] = useState(false);
  const hero = cfg.photos.find((p) => p.featured) ?? cfg.photos[0];

  useEffect(() => {
    if (!canvasRef.current) return;
    confetti.current = new Confetti(canvasRef.current);
    const onResize = () => confetti.current?.resize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      confetti.current?.destroy();
    };
  }, []);

  // Fire a short, controlled celebration when the finale appears.
  useEffect(() => {
    if (!visible || !confetti.current) return;
    if (playing) cue("chime");
    if (reduced) {
      confetti.current.burst(0.5, 0.4, 50);
      return;
    }
    const bursts = [
      [0.2, 0.35],
      [0.8, 0.3],
      [0.5, 0.25],
      [0.35, 0.4],
      [0.7, 0.45],
    ];
    const timers = bursts.map(([x, y], i) =>
      window.setTimeout(() => confetti.current?.burst(x, y, 90), i * 600)
    );
    const rain = window.setTimeout(() => confetti.current?.rain(50), 3200);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(rain);
    };
  }, [visible, reduced, playing, cue]);

  if (!visible) return null;

  return (
    <section
      id="finale"
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-night to-electric-deep py-24 text-center"
      aria-label={`Happy Birthday, ${cfg.personName}`}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-30 h-full w-full"
      />

      {/* photographs drifting up behind */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {cfg.photos.slice(0, 5).map((p, i) => (
          <motion.div
            key={p.src}
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 0.5 }}
            transition={{ duration: reduced ? 0 : 1.4, delay: i * 0.2 }}
            className="absolute w-28 sm:w-36"
            style={{
              left: `${10 + i * 18}%`,
              bottom: `${8 + (i % 3) * 16}%`,
              rotate: (i % 2 ? 1 : -1) * (4 + i),
            }}
          >
            <div className="paper-edge">
              <PaperPhoto src={p.src} alt="" className="aspect-[4/5] w-full" seed={i} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* drawn heart (where the candle smoke resolves) */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: reduced ? 0 : 1, ease: "backOut" }}
        className="relative z-20 mb-6"
      >
        <Heart className="h-16 w-16 text-pink" />
      </motion.div>

      <div className="relative z-20 px-6">
        <motion.h2
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: reduced ? 0 : 0.8 }}
          className="font-display leading-[0.9] text-sunflower"
          style={{ ["--shadow-color" as string]: cfg.colors.pink }}
        >
          <span className="ink-shadow block text-5xl sm:text-7xl md:text-8xl">
            {cfg.finalHeadline[0]}
          </span>
          <span className="ink-shadow block text-6xl sm:text-8xl md:text-[9rem]">
            {cfg.finalHeadline[1]}
          </span>
        </motion.h2>

        <div className="mx-auto mt-8 max-w-xl font-sans text-lg leading-relaxed text-ivory/90">
          {cfg.finalWish.map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: reduced ? 0 : 1 + i * 0.15 }}
            >
              {line}
            </motion.p>
          ))}
        </div>

        {/* the largest shared photo settles in the centre */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, rotate: -4 }}
          animate={{ scale: 1, opacity: 1, rotate: -2 }}
          transition={{ duration: reduced ? 0 : 1, delay: reduced ? 0 : 1.6 }}
          className="mx-auto mt-12 w-[70vw] max-w-[320px]"
        >
          <div className="paper-edge relative">
            <PaperPhoto
              src={hero.src}
              alt={hero.alt}
              className="aspect-[4/5] w-full"
              seed={0}
            />
            <Star className="absolute -right-6 -top-6 h-10 w-10 text-sunflower" />
          </div>
          <p className="mt-6 font-sans text-base text-ivory/70">
            {cfg.letterSignoff}
          </p>
          <p className="font-hand text-4xl text-ivory">{cfg.creatorName}</p>
        </motion.div>

        {/* closing actions */}
        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button
            type="button"
            onClick={onReplay}
            className="rounded-full border-2 border-ivory/70 px-8 py-3 font-condensed text-lg tracking-[0.2em] text-ivory transition-colors hover:bg-ivory hover:text-ink"
          >
            ↺ REPLAY THE STORY
          </button>
          <button
            type="button"
            onClick={() => setShowCard(true)}
            className="rounded-full bg-pink px-8 py-3 font-condensed text-lg tracking-[0.2em] text-ivory shadow-paper transition-transform active:scale-95"
          >
            ♥ KEEP THIS MEMORY
          </button>
        </div>

        {cfg.enableSharing && (
          <button
            type="button"
            onClick={() => {
              if (navigator.share) {
                navigator
                  .share({ title: document.title, url: window.location.href })
                  .catch(() => {});
              }
            }}
            className="mt-4 font-condensed text-sm tracking-[0.2em] text-lavender underline-offset-4 hover:underline"
          >
            SHARE THIS SURPRISE
          </button>
        )}
      </div>

      {showCard && <KeepsakeCard onClose={() => setShowCard(false)} hero={hero} />}
    </section>
  );
}

/* A clean, printable / saveable card built from the configured content. */
function KeepsakeCard({
  onClose,
  hero,
}: {
  onClose: () => void;
  hero: (typeof birthdayConfig.photos)[number];
}) {
  const cfg = birthdayConfig;
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Your keepsake card"
      onClick={onClose}
    >
      <div
        className="print-card relative max-h-[90vh] w-full max-w-md overflow-auto rounded-lg bg-ivory p-8 text-ink shadow-paper"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex justify-center">
          <Star className="h-8 w-8 text-pink" />
        </div>
        <p className="text-center font-condensed text-sm tracking-[0.4em] text-pink">
          {cfg.birthdayDateLabel}
        </p>
        <h3 className="mt-2 text-center font-display text-4xl text-electric">
          Happy Birthday, {cfg.nickname}
        </h3>
        <div className="mx-auto my-6 w-40">
          <div className="paper-edge">
            <PaperPhoto
              src={hero.src}
              alt={hero.alt}
              className="aspect-[4/5] w-full"
              seed={0}
            />
          </div>
        </div>
        <p className="text-center font-sans text-base leading-relaxed text-ink/80">
          {cfg.finalMessage[cfg.finalMessage.length - 1]}
        </p>
        <p className="mt-4 text-center font-sans text-sm text-ink/60">
          {cfg.letterSignoff}
        </p>
        <p className="text-center font-hand text-3xl text-electric">
          {cfg.creatorName}
        </p>

        <div className="mt-8 flex justify-center gap-3 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-full bg-electric px-6 py-2 font-condensed tracking-[0.2em] text-ivory"
          >
            PRINT / SAVE PDF
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border-2 border-ink/30 px-6 py-2 font-condensed tracking-[0.2em] text-ink"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}

function Heart({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <path
        d="M50 88 C-10 50 18 8 50 36 C82 8 110 50 50 88 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
