import { useEffect, useRef } from "react";
import { gsap, handPlaced } from "../lib/gsapSetup";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { usePointerParallax } from "../hooks/usePointerParallax";
import { useMagnetic } from "../hooks/useMagnetic";
import { birthdayConfig } from "../data/birthdayConfig";
import { PaperPhoto } from "./PaperPhoto";
import { Star, Cross, Flower, Squiggle, GridMark } from "./Doodles";

/**
 * Section 1 — the hero. Mirrors the reference: electric-blue field, oversized
 * yellow serif headline with a pink mis-print shadow, a paper-cut portrait with
 * a party crown, abstract yellow blobs for depth, and a single call to action.
 * The entrance is a 9-beat GSAP timeline; scrolling away lifts the title,
 * enlarges the portrait and blooms one blob into a transition mask.
 */
export function BirthdayHero({ play }: { play: boolean }) {
  const reduced = useReducedMotion();
  const section = usePointerParallax<HTMLElement>();
  const scope = useRef<HTMLDivElement>(null);
  const btn = useMagnetic<HTMLButtonElement>(0.45);
  const hero = birthdayConfig;
  const portrait = hero.photos.find((p) => p.featured) ?? hero.photos[0];

  // --- Entrance choreography -------------------------------------------------
  useEffect(() => {
    if (!play) return;
    const el = scope.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(el.querySelectorAll("[data-anim]"), { opacity: 1, clearProps: "transform" });
        return;
      }
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".hero-bg", { scale: 1.15, opacity: 0, duration: 0.8 })
        .from(
          ".hero-blob",
          { scale: 0.2, opacity: 0, duration: 0.9, stagger: 0.12, ease: "back.out(1.6)" },
          "-=0.4"
        )
        .from(
          ".hero-word",
          { yPercent: 120, opacity: 0, duration: 0.7, stagger: 0.12 },
          "-=0.5"
        )
        .from(
          ".hero-portrait",
          { yPercent: 60, opacity: 0, duration: 0.9, ease: handPlaced },
          "-=0.4"
        )
        .from(
          ".hero-outline",
          { opacity: 0, scale: 1.05, transformOrigin: "center", duration: 0.5 },
          "-=0.5"
        )
        .from(
          ".hero-hat",
          { y: -120, rotate: -25, opacity: 0, duration: 0.7, ease: "bounce.out" },
          "-=0.3"
        )
        .from(
          ".hero-doodle",
          { scale: 0, opacity: 0, duration: 0.5, stagger: 0.08, ease: "back.out(2)" },
          "-=0.4"
        )
        .from(".hero-date", { rotate: -8, y: 20, opacity: 0, duration: 0.6 }, "-=0.4")
        .from(".hero-cta", { y: 24, opacity: 0, duration: 0.6 }, "-=0.2")
        .from(".hero-hint", { opacity: 0, duration: 0.6 }, "-=0.2");
    }, el);

    return () => ctx.revert();
  }, [play, reduced]);

  // --- Scroll-away transition ------------------------------------------------
  useEffect(() => {
    if (reduced) return;
    const el = scope.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
      tl.to(".hero-headline", { yPercent: -40, opacity: 0.2 }, 0)
        .to(".hero-portrait", { scale: 1.25, yPercent: -8 }, 0)
        .to(".hero-cta, .hero-hint, .hero-date", { opacity: 0, y: -30 }, 0)
        .to(".hero-mask", { scale: 26, opacity: 1, ease: "power2.in" }, 0.25);
    }, el);
    return () => ctx.revert();
  }, [reduced]);

  const handleBegin = () => {
    const next = document.getElementById("first-reveal");
    next?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  };

  const [line1, line2] = hero.heroTitle;

  return (
    <section
      ref={section}
      id="hero"
      className="relative min-h-[100svh] w-full overflow-hidden bg-electric"
      aria-label={`${hero.personName}'s birthday`}
    >
      <div ref={scope} className="relative min-h-[100svh] w-full">
        {/* Background field + grain */}
        <div className="hero-bg grain absolute inset-0 bg-gradient-to-br from-electric to-electric-deep" />

        {/* Thin hot-pink frame */}
        <div className="pointer-events-none absolute inset-3 z-30 rounded-[10px] border-2 border-pink/80 sm:inset-5" />

        {/* Yellow depth blobs */}
        <div
          data-parallax="1.4"
          className="hero-blob absolute -left-24 top-10 h-72 w-72 rounded-full bg-sunflower/90 blur-[2px]"
        />
        <div
          data-parallax="2"
          className="hero-blob absolute right-[18%] top-1/3 h-40 w-40 rounded-[42%_58%_61%_39%] bg-sunflower"
        />
        <div
          data-parallax="1"
          className="hero-blob absolute -right-16 bottom-[-4rem] h-80 w-80 rounded-full bg-sunflower/80"
        />

        {/* The single yellow shape that becomes the scene-transition mask */}
        <div className="hero-mask pointer-events-none absolute bottom-[14%] right-[26%] z-20 h-24 w-24 rounded-full bg-sunflower opacity-0" />

        {/* Content grid */}
        <div className="relative z-30 mx-auto flex min-h-[100svh] max-w-7xl flex-col items-center gap-5 px-6 pb-24 pt-12 sm:gap-8 md:grid md:grid-cols-2 md:items-center md:gap-4 md:py-10">
          {/* Headline + meta */}
          <div className="hero-headline order-2 w-full text-center md:order-1 md:text-left">
            <p className="hero-word mb-4 inline-block -rotate-2 bg-pink px-3 py-1 font-condensed text-sm tracking-[0.3em] text-ivory">
              A BIRTHDAY FILM · FOR {hero.nickname.toUpperCase()}
            </p>
            <h1
              className="font-display leading-[0.86] text-sunflower"
              style={{ ["--shadow-color" as string]: hero.colors.pink }}
            >
              <span className="hero-word ink-shadow block text-[14vw] sm:text-[13vw] md:text-[7.5vw]">
                {line1}
              </span>
              <span className="hero-word ink-shadow block text-[14vw] sm:text-[13vw] md:text-[7.5vw]">
                {line2}
              </span>
            </h1>

            <div className="hero-date mt-6 inline-flex items-center gap-3 rounded-sm bg-ivory px-4 py-2 text-ink shadow-paper-sm">
              <span className="font-condensed text-2xl leading-none tracking-[0.18em]">
                {hero.birthdayDateLabel}
              </span>
              <span className="h-7 w-px bg-ink/30" />
              <span className="font-hand text-xl leading-none">
                a day worth celebrating
              </span>
            </div>

            <div className="mt-8 flex flex-col items-center gap-4 md:items-start">
              <button
                ref={btn}
                onClick={handleBegin}
                className="hero-cta group relative inline-flex items-center gap-3 rounded-full bg-pink px-8 py-4 font-condensed text-xl tracking-[0.2em] text-ivory shadow-paper transition-transform duration-150 active:scale-95"
              >
                {hero.beginLabel.toUpperCase()}
                <span className="transition-transform duration-200 group-hover:translate-x-1">
                  ➜
                </span>
              </button>
              <p className="hero-hint font-hand text-xl text-lavender">
                {hero.scrollHint}
              </p>
            </div>
          </div>

          {/* Portrait */}
          <div className="order-1 flex w-full justify-center md:order-2 md:justify-end">
            <div data-parallax="3" className="relative">
              {/* Party crown */}
              <PartyCrown className="hero-hat absolute -top-10 left-1/2 z-20 h-20 w-28 -translate-x-1/2 -rotate-6 text-sunflower sticker-shadow" />

              <div className="hero-portrait paper-edge relative w-[54vw] max-w-[300px] rotate-[-3deg] md:w-[62vw] md:max-w-[360px]">
                <PaperPhoto
                  src={portrait.src}
                  alt={portrait.alt}
                  caption={portrait.caption}
                  duotone
                  eager
                  className="aspect-[4/5] w-full"
                  seed={0}
                />
              </div>

              {/* Hand-drawn paper outline overlay */}
              <svg
                className="hero-outline pointer-events-none absolute -inset-3 z-10 h-[calc(100%+1.5rem)] w-[calc(100%+1.5rem)] text-ivory"
                viewBox="0 0 100 120"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M4 6 Q50 1 96 5 Q99 60 95 114 Q50 119 5 115 Q1 60 4 6 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                  opacity="0.8"
                />
              </svg>

              {/* Doodles around the portrait */}
              <Star className="hero-doodle absolute -left-8 top-6 h-9 w-9 text-pink" />
              <Cross className="hero-doodle absolute -right-6 top-1/3 h-7 w-7 text-ivory" />
              <Flower className="hero-doodle absolute -bottom-8 -left-4 h-12 w-12 text-pink" />
              <GridMark className="hero-doodle absolute -right-8 bottom-10 h-6 w-6 text-lavender" />
              <Squiggle className="hero-doodle absolute -bottom-10 right-2 h-5 w-24 text-sunflower" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PartyCrown({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 80" className={className} aria-hidden="true">
      <path
        d="M8 70 L20 24 L44 54 L60 14 L76 54 L100 24 L112 70 Z"
        fill="currentColor"
        stroke="#17131F"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <circle cx="20" cy="22" r="6" fill="#FF2B91" />
      <circle cx="60" cy="12" r="6" fill="#FF2B91" />
      <circle cx="100" cy="22" r="6" fill="#FF2B91" />
      <rect x="8" y="66" width="104" height="9" fill="#FF2B91" rx="3" />
    </svg>
  );
}
