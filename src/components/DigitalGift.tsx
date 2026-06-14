import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useSound } from "../context/SoundContext";
import { Confetti } from "../lib/confetti";
import { CandleInteraction } from "./CandleInteraction";
import { birthdayConfig } from "../data/birthdayConfig";

type Stage = "closed" | "cake";

/**
 * Section 8 — the digital gift. Tap the box: the ribbon loosens, the lid
 * launches, confetti bursts, the room turns to night-sky blue, and a cake rises
 * with candles to light. Blowing them out (Section: CandleInteraction) calls
 * onWishComplete, which the page uses to unveil the finale.
 */
export function DigitalGift({ onWishComplete }: { onWishComplete: () => void }) {
  const reduced = useReducedMotion();
  const { playing, cue } = useSound();
  const [stage, setStage] = useState<Stage>("closed");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const confetti = useRef<Confetti | null>(null);

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

  const open = () => {
    if (stage !== "closed") return;
    if (playing) cue("pop");
    confetti.current?.burst(0.5, 0.5, reduced ? 60 : 160);
    // let the lid fly, then bring up the cake
    window.setTimeout(() => setStage("cake"), reduced ? 100 : 700);
  };

  return (
    <section
      id="gift"
      className={`relative flex min-h-[100svh] items-center justify-center overflow-hidden py-20 transition-colors duration-1000 ${
        stage === "closed" ? "bg-electric" : "bg-night"
      }`}
      aria-label="Your final surprise"
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-30 h-full w-full"
      />

      {/* starfield once it's night */}
      {stage === "cake" && !reduced && <StarField />}

      <div className="relative z-20 flex flex-col items-center gap-8 px-6 text-center">
        <AnimatePresence mode="wait">
          {stage === "closed" ? (
            <motion.button
              key="box"
              type="button"
              onClick={open}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              whileHover={reduced ? undefined : { scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="group flex flex-col items-center gap-6"
              aria-label="Tap to open your final surprise"
            >
              <GiftBox shake={!reduced} />
              <span className="font-display text-3xl text-ivory sm:text-4xl">
                Tap to open your final surprise.
              </span>
            </motion.button>
          ) : (
            <motion.div
              key="cake"
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: reduced ? 0 : 0.8, ease: "backOut" }}
            >
              <h2 className="mb-10 font-display text-4xl text-ivory sm:text-5xl">
                Make a wish,{" "}
                <span className="text-sunflower">{birthdayConfig.nickname}.</span>
              </h2>
              <CandleInteraction candleCount={5} onComplete={onWishComplete} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function GiftBox({ shake }: { shake: boolean }) {
  return (
    <div className={`relative ${shake ? "group-hover:animate-floaty" : ""}`}>
      {/* lid */}
      <div className="relative z-10 mx-auto h-10 w-44 rounded-t-md bg-pink shadow-paper" />
      {/* ribbon knot */}
      <div className="absolute left-1/2 top-[-14px] z-20 h-8 w-8 -translate-x-1/2 rotate-45 rounded-sm bg-sunflower" />
      {/* body */}
      <div className="relative mx-auto h-40 w-40 rounded-b-md bg-electric-deep shadow-paper">
        <div className="absolute left-1/2 top-0 h-full w-6 -translate-x-1/2 bg-sunflower" />
        <div className="absolute left-0 top-1/2 h-6 w-full -translate-y-1/2 bg-sunflower" />
      </div>
    </div>
  );
}

function StarField() {
  const stars = Array.from({ length: 40 }, (_, i) => ({
    left: `${(i * 37) % 100}%`,
    top: `${(i * 53) % 100}%`,
    delay: `${(i % 5) * 0.4}s`,
    size: 2 + (i % 3),
  }));
  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-ivory/80"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            animation: `flicker ${1.5 + (i % 4) * 0.5}s ease-in-out ${s.delay} infinite`,
          }}
        />
      ))}
    </div>
  );
}
