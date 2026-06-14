import { useEffect, useRef, useState } from "react";
import { gsap } from "../lib/gsapSetup";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { birthdayConfig } from "../data/birthdayConfig";
import { Star } from "./Doodles";

/**
 * Section 0 — a 2-second wrapping-paper reveal.
 * A yellow dot blooms into a spotlight, a handwritten line appears, then the
 * screen tears open vertically to expose the blue hero already mounted behind.
 * Skippable with a click, a key, or any scroll/touch. No fake percentage loader.
 */
export function OpeningSequence({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const leftHalf = useRef<HTMLDivElement>(null);
  const rightHalf = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLParagraphElement>(null);
  const reduced = useReducedMotion();
  const [closing, setClosing] = useState(false);
  const finished = useRef(false);
  const tlRef = useRef<ReturnType<typeof gsap.timeline> | null>(null);
  const finishRef = useRef<() => void>(() => {});

  useEffect(() => {
    document.body.classList.add("story-locked");
    return () => document.body.classList.remove("story-locked");
  }, []);

  useEffect(() => {
    const finish = () => {
      if (finished.current) return;
      finished.current = true;
      document.body.classList.remove("story-locked");
      onDone();
    };
    finishRef.current = finish;

    if (reduced) {
      // No theatrics — show the line briefly, then reveal.
      const t = window.setTimeout(finish, 600);
      return () => window.clearTimeout(t);
    }

    const tl = gsap.timeline({ onComplete: finish });
    tlRef.current = tl;
    tl.set([leftHalf.current, rightHalf.current], { xPercent: 0 })
      .fromTo(
        dot.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(2)" }
      )
      .to(dot.current, {
        scale: 16,
        duration: 0.7,
        ease: "power3.in",
        opacity: 0.9,
      })
      .fromTo(
        line.current,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.4 },
        "-=0.5"
      )
      .to(line.current, { opacity: 0, duration: 0.3 }, "+=0.55")
      // Tear the paper apart.
      .add(() => setClosing(true))
      .to(leftHalf.current, { xPercent: -105, duration: 0.7, ease: "power3.inOut" })
      .to(
        rightHalf.current,
        { xPercent: 105, duration: 0.7, ease: "power3.inOut" },
        "<"
      );

    return () => {
      tl.kill();
    };
  }, [reduced, onDone]);

  // Skipping just fast-forwards the existing timeline so its onComplete (which
  // calls finish) always fires — no killing tweens, no race, no frozen frames.
  const skip = () => {
    if (finished.current) return;
    setClosing(true);
    const tl = tlRef.current;
    if (reduced || !tl) {
      finishRef.current();
      return;
    }
    tl.timeScale(6);
  };

  // Any scroll / wheel / touch / key skips the intro.
  useEffect(() => {
    const onAny = () => skip();
    window.addEventListener("wheel", onAny, { passive: true, once: true });
    window.addEventListener("touchmove", onAny, { passive: true, once: true });
    window.addEventListener("keydown", onAny, { once: true });
    return () => {
      window.removeEventListener("wheel", onAny);
      window.removeEventListener("touchmove", onAny);
      window.removeEventListener("keydown", onAny);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[100]"
      aria-hidden={closing}
      role="button"
      tabIndex={0}
      aria-label="Skip the opening"
      onClick={skip}
    >
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          ref={dot}
          className="h-24 w-24 rounded-full bg-sunflower shadow-glow"
        />
        <p
          ref={line}
          className="absolute px-6 text-center font-hand text-3xl text-ivory opacity-0 sm:text-4xl"
        >
          {birthdayConfig.openingLine}
        </p>
      </div>

      {/* Two paper halves that part to reveal the hero. */}
      <div
        ref={leftHalf}
        className="grain absolute inset-y-0 left-0 w-1/2 overflow-hidden bg-pink"
      >
        <Star className="absolute right-6 top-10 h-8 w-8 text-sunflower/70" />
      </div>
      <div
        ref={rightHalf}
        className="grain absolute inset-y-0 right-0 w-1/2 overflow-hidden bg-pink"
      >
        <Star className="absolute left-8 bottom-16 h-6 w-6 text-ivory/70" />
      </div>
    </div>
  );
}
