import { useEffect, useRef } from "react";
import { gsap } from "../lib/gsapSetup";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { birthdayConfig } from "../data/birthdayConfig";
import { PaperPhoto } from "./PaperPhoto";

/**
 * Section 7 — the letter. The emotional calm of the film: visual noise drops
 * away, the background warms to ivory paper, and the message reveals a
 * paragraph at a time as you read down. Deliberately NOT animated word-by-word
 * — readability first.
 */
export function PersonalLetter() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const cfg = birthdayConfig;
  const sharedPhoto = cfg.photos[cfg.photos.length - 1];

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const ctx = gsap.context(() => {
      gsap.from(".letter-line", {
        opacity: 0,
        y: 24,
        duration: 0.7,
        stagger: 0.25,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 70%" },
      });
      gsap.from(".letter-photo", {
        opacity: 0,
        rotate: -12,
        y: 30,
        duration: 0.8,
        ease: "back.out(1.4)",
        scrollTrigger: { trigger: el, start: "top 60%" },
      });
    }, el);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      id="letter"
      className="grain relative bg-ivory py-28 text-ink"
      aria-label="A letter for you"
    >
      <div ref={ref} className="mx-auto max-w-2xl px-6">
        <div className="relative rounded-sm bg-white/60 p-8 shadow-paper sm:p-12">
          {/* Tape + clipped photo */}
          <div className="letter-photo absolute -right-4 -top-8 w-28 rotate-6 sm:-right-10 sm:w-36">
            <div className="absolute left-1/2 top-0 z-10 h-6 w-16 -translate-x-1/2 -translate-y-1/2 rotate-3 bg-sunflower/70" />
            <div className="paper-edge">
              <PaperPhoto
                src={sharedPhoto.src}
                alt={sharedPhoto.alt}
                className="aspect-[4/5] w-full"
                seed={5}
              />
            </div>
          </div>

          <h2 className="letter-line relative mb-8 inline-block font-display text-4xl sm:text-5xl">
            {cfg.letterSalutation}
            <Underline className="absolute -bottom-2 left-0 h-3 w-full text-pink" />
          </h2>

          <div className="space-y-6 font-sans text-lg leading-relaxed text-ink/90">
            {cfg.finalMessage.map((para, i) => {
              const isLast = i === cfg.finalMessage.length - 1;
              return (
                <p
                  key={i}
                  className={`letter-line ${
                    isLast ? "font-display text-2xl text-pink" : ""
                  }`}
                >
                  {para}
                  {isLast && (
                    <Underline className="mt-1 block h-3 w-48 text-sunflower" />
                  )}
                </p>
              );
            })}
          </div>

          <div className="letter-line mt-10">
            <p className="font-sans text-base text-ink/70">{cfg.letterSignoff}</p>
            <p className="font-hand text-4xl text-electric">{cfg.creatorName}</p>
            <p className="font-condensed text-xs tracking-[0.3em] text-ink/50">
              {cfg.creatorRelationship.toUpperCase()}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* A wobbly hand-drawn underline. */
function Underline({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 12"
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M2 8 Q40 2 80 7 T160 6 T198 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
