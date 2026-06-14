import { useEffect, useRef } from "react";
import { gsap } from "../lib/gsapSetup";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { birthdayConfig } from "../data/birthdayConfig";
import { PaperPhoto } from "./PaperPhoto";

/**
 * Section 5 — "Things that make you, you." Not another gallery: seven phrases,
 * each with a deliberately different kinetic behaviour. Edit the words in
 * birthdayConfig.personalityTraits — the treatments cycle to fit any count.
 */
export function KineticTraits() {
  const reduced = useReducedMotion();
  const traits = birthdayConfig.personalityTraits;

  // Map each trait to a treatment; cycle if the list is longer/shorter.
  const treatments = [
    "stretch",
    "curve",
    "behind",
    "scatter",
    "wrap",
    "hand",
    "mask",
  ] as const;

  return (
    <section
      id="traits"
      className="relative bg-ink"
      aria-label="Things that make you, you"
    >
      <div className="mx-auto max-w-6xl px-6 py-24">
        <p className="mb-16 text-center font-condensed text-sm tracking-[0.5em] text-sunflower">
          THINGS THAT MAKE YOU, YOU
        </p>
        <div className="flex flex-col gap-28">
          {traits.map((t, i) => {
            const kind = treatments[i % treatments.length];
            return (
              <Trait key={i} text={t} kind={kind} index={i} reduced={reduced} />
            );
          })}
        </div>
      </div>
    </section>
  );
}

type Kind =
  | "stretch"
  | "curve"
  | "behind"
  | "scatter"
  | "wrap"
  | "hand"
  | "mask";

function Trait({
  text,
  kind,
  index,
  reduced,
}: {
  text: string;
  kind: Kind;
  index: number;
  reduced: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const photo = birthdayConfig.photos[index % birthdayConfig.photos.length];

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const ctx = gsap.context(() => {
      const common = {
        scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 40%" },
      };

      if (kind === "stretch") {
        gsap.from(el.querySelector(".kt"), {
          ...common,
          scaleX: 0.2,
          opacity: 0,
          transformOrigin: "left center",
          duration: 1,
          ease: "power3.out",
        });
      } else if (kind === "scatter") {
        gsap.from(el.querySelectorAll(".kt-letter"), {
          scrollTrigger: { trigger: el, start: "top 80%" },
          x: () => gsap.utils.random(-220, 220),
          y: () => gsap.utils.random(-120, 120),
          rotate: () => gsap.utils.random(-90, 90),
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: { each: 0.02, from: "random" },
        });
      } else if (kind === "behind") {
        gsap.fromTo(
          el.querySelector(".kt-cover"),
          { xPercent: -10 },
          {
            xPercent: 120,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              end: "bottom 30%",
              scrub: 1,
            },
          }
        );
      } else if (kind === "curve") {
        gsap.from(el.querySelector(".kt"), {
          ...common,
          opacity: 0,
          y: 40,
          duration: 1,
        });
      } else if (kind === "hand") {
        gsap.from(el.querySelectorAll(".kt-word"), {
          scrollTrigger: { trigger: el, start: "top 80%" },
          opacity: 0,
          y: 20,
          rotate: -4,
          stagger: 0.12,
          duration: 0.6,
        });
      } else if (kind === "wrap" || kind === "mask") {
        gsap.from(el, { ...common, opacity: 0, y: 50, duration: 1 });
      }
    }, el);
    return () => ctx.revert();
  }, [kind, reduced]);

  // -- Treatments ------------------------------------------------------------
  if (kind === "stretch") {
    return (
      <div ref={ref} className="overflow-hidden">
        <p className="kt whitespace-nowrap font-display text-[12vw] leading-none text-sunflower md:text-[7vw]">
          {text}
        </p>
      </div>
    );
  }

  if (kind === "curve") {
    return (
      <div ref={ref} className="flex justify-center">
        <svg viewBox="0 0 800 240" className="kt w-full max-w-3xl text-pink">
          <defs>
            <path id={`curve-${index}`} d="M40 200 Q400 20 760 200" fill="none" />
          </defs>
          <text className="font-display" fill="currentColor" fontSize="58">
            <textPath href={`#curve-${index}`} startOffset="50%" textAnchor="middle">
              {text}
            </textPath>
          </text>
        </svg>
      </div>
    );
  }

  if (kind === "behind") {
    return (
      <div ref={ref} className="relative overflow-hidden py-6">
        <p className="font-display text-[10vw] leading-none text-lavender md:text-[6vw]">
          {text}
        </p>
        {/* The moving photo that "wipes" across to reveal the phrase. In reduced
            motion it is omitted so the words stay fully legible. */}
        {!reduced && (
          <div className="kt-cover pointer-events-none absolute inset-y-2 left-0 w-1/3">
            <div className="paper-edge h-full rotate-3">
              <PaperPhoto
                src={photo.src}
                alt={photo.alt}
                className="h-full w-full"
                seed={index}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  if (kind === "scatter") {
    return (
      <div ref={ref} className="text-center">
        <p className="font-display text-[11vw] leading-none text-ivory md:text-[6.5vw]">
          {text.split("").map((ch, i) => (
            <span key={i} className="kt-letter inline-block">
              {ch === " " ? " " : ch}
            </span>
          ))}
        </p>
      </div>
    );
  }

  if (kind === "wrap") {
    return (
      <div ref={ref} className="relative">
        <div className="float-left mr-6 mb-2 h-40 w-40 sm:h-52 sm:w-52">
          <div
            className="paper-edge h-full w-full -rotate-3"
            style={{ shapeOutside: "circle(50%)" }}
          >
            <PaperPhoto
              src={photo.src}
              alt={photo.alt}
              duotone
              className="h-full w-full rounded-full"
              seed={index}
            />
          </div>
        </div>
        <p className="font-display text-4xl leading-tight text-sunflower sm:text-6xl">
          {text}
        </p>
        <div className="clear-both" />
      </div>
    );
  }

  if (kind === "hand") {
    return (
      <div ref={ref} className="text-center">
        <p className="font-hand text-5xl leading-tight text-pink sm:text-7xl">
          {text.split(" ").map((w, i) => (
            <span key={i} className="kt-word mr-3 inline-block">
              {w}
            </span>
          ))}
        </p>
      </div>
    );
  }

  // mask — text filled with a photograph (gradient guarantees it stays visible)
  return (
    <div ref={ref} className="text-center">
      <p
        className="font-display text-[12vw] font-bold leading-none md:text-[8vw]"
        style={{
          backgroundImage: `url(${photo.src}.jpg), linear-gradient(120deg, #FFC400, #FF2B91, #B9A8FF)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        {text}
      </p>
    </div>
  );
}
