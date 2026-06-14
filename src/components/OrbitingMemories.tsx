import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "../lib/gsapSetup";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { birthdayConfig } from "../data/birthdayConfig";
import { PaperPhoto } from "./PaperPhoto";

const SATELLITE_COUNT = 8;

/**
 * Section 4 — memories orbit a central portrait. Scrolling spins the ring
 * (down = forward, up = reverse); the photo nearest the front grows and shows
 * its line. Hover/tap pauses and enlarges one while the rest dim. At the very
 * end the orbit collapses inward and becomes a candle flame for the next
 * chapter. Reduced motion swaps in a static, fully captioned ring.
 *
 * All motion is driven through refs + a single ScrollTrigger so hovering never
 * tears down the pinned trigger, and nothing runs on a permanent ticker.
 */
export function OrbitingMemories() {
  const reduced = useReducedMotion();
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const rotation = useRef(0);
  const activeRef = useRef<number | null>(null);
  const placeRef = useRef<() => void>(() => {});

  const photos = birthdayConfig.photos;
  const central = photos.find((p) => p.featured) ?? photos[0];
  const ring = photos.filter((p) => p !== central);
  const satellites = Array.from(
    { length: SATELLITE_COUNT },
    (_, i) => ring[i % ring.length]
  );

  useEffect(() => {
    const el = section.current;
    const st = stage.current;
    if (!el || !st || reduced) return;

    const ctx = gsap.context(() => {
      const nodes = gsap.utils.toArray<HTMLElement>(".orbit-sat");

      const place = () => {
        const rect = st.getBoundingClientRect();
        const rx = Math.min(rect.width, 720) * 0.36;
        const ry = rx * 0.62;
        const act = activeRef.current;

        nodes.forEach((node, i) => {
          const base = (i / SATELLITE_COUNT) * Math.PI * 2;
          const theta = base + rotation.current;
          const x = Math.cos(theta) * rx;
          const y = Math.sin(theta) * ry;
          const depth = (Math.sin(theta) + 1) / 2; // 1 at the front (bottom)
          const isActive = act === i;
          gsap.set(node, {
            xPercent: -50,
            yPercent: -50,
            x,
            y,
            scale: isActive ? 1.5 : 0.6 + depth * 0.34,
            zIndex: isActive ? 200 : Math.round(depth * 100),
            opacity: 0.5 + depth * 0.5,
            filter: act !== null && !isActive ? "brightness(0.45)" : "none",
          });
          const cap = node.querySelector<HTMLElement>(".orbit-cap");
          if (cap) {
            const show = act !== null ? isActive : depth > 0.92;
            gsap.set(cap, { opacity: show ? 1 : 0 });
          }
        });
      };
      placeRef.current = place;

      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "+=220%",
        scrub: 1,
        pin: ".orbit-stage",
        anticipatePin: 1,
        invalidateOnRefresh: true,
        // Stacked-pin refresh order (see FirstMemoryReveal); below filmstrip.
        refreshPriority: 10,
        onUpdate: (self) => {
          if (activeRef.current === null) {
            rotation.current = self.progress * Math.PI * 4;
          }
          const collapse = gsap.utils.clamp(0, 1, (self.progress - 0.82) / 0.18);
          gsap.set(".orbit-collapse", {
            scale: 1 - collapse,
            opacity: 1 - collapse,
          });
          gsap.set(".orbit-flame", { scale: collapse, opacity: collapse });
          place();
        },
        onRefresh: place,
      });

      place();
    }, el);

    return () => ctx.revert();
  }, [reduced]);

  const focus = (i: number | null) => {
    activeRef.current = i;
    placeRef.current();
  };

  return (
    <section
      ref={section}
      id="orbit"
      className="relative bg-gradient-to-b from-electric to-night"
      aria-label="A gallery of memories in orbit"
    >
      <div className="orbit-stage relative flex min-h-[100svh] items-center justify-center overflow-hidden">
        <p className="absolute top-[8%] left-1/2 z-40 -translate-x-1/2 px-6 text-center font-condensed text-sm tracking-[0.4em] text-lavender">
          MEMORIES IN ORBIT · {reduced ? "TAP A PHOTO" : "SCROLL TO SPIN"}
        </p>

        <div
          ref={stage}
          className={`relative h-[68svh] w-full max-w-3xl ${
            reduced
              ? "grid grid-cols-2 place-items-center gap-6 p-6 sm:grid-cols-3"
              : ""
          }`}
        >
          <div className="orbit-collapse contents">
            {!reduced && (
              <div className="pointer-events-none absolute left-1/2 top-1/2 z-[60] w-[34vw] max-w-[220px] -translate-x-1/2 -translate-y-1/2">
                <div className="paper-edge rotate-[-2deg]">
                  <PaperPhoto
                    src={central.src}
                    alt={central.alt}
                    duotone
                    className="aspect-square w-full"
                    seed={0}
                  />
                </div>
              </div>
            )}

            {satellites.map((p, i) => (
              <button
                key={i}
                type="button"
                className={`orbit-sat ${
                  reduced ? "relative" : "absolute left-1/2 top-1/2"
                } w-[26vw] max-w-[150px] cursor-pointer rounded-sm`}
                onMouseEnter={() => !reduced && focus(i)}
                onMouseLeave={() => !reduced && focus(null)}
                onFocus={() => !reduced && focus(i)}
                onBlur={() => !reduced && focus(null)}
                onClick={() => focus(activeRef.current === i ? null : i)}
                aria-label={`${p.alt}. ${p.caption}`}
              >
                <div className="bg-ivory p-1.5 shadow-paper-sm">
                  <PaperPhoto
                    src={p.src}
                    alt={p.alt}
                    className="aspect-square w-full"
                    seed={i + 1}
                  />
                </div>
                <span
                  className={`orbit-cap pointer-events-none absolute -bottom-9 left-1/2 w-[170px] -translate-x-1/2 text-center font-hand text-lg text-ivory ${
                    reduced ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {p.caption}
                </span>
              </button>
            ))}
          </div>

          {!reduced && (
            <div className="orbit-flame pointer-events-none absolute left-1/2 top-1/2 z-[70] -translate-x-1/2 -translate-y-1/2 opacity-0">
              <Flame />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Flame() {
  return (
    <div className="relative flex flex-col items-center">
      <div className="h-16 w-10 animate-flicker rounded-[50%_50%_50%_50%/60%_60%_40%_40%] bg-gradient-to-t from-pink via-sunflower to-ivory blur-[1px]" />
      <div className="-mt-2 h-24 w-3 rounded-sm bg-ivory shadow-paper-sm" />
    </div>
  );
}
