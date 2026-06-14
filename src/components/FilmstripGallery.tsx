import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "../lib/gsapSetup";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { birthdayConfig } from "../data/birthdayConfig";
import { PaperPhoto } from "./PaperPhoto";
import { Star } from "./Doodles";

type Panel =
  | { type: "photo"; index: number }
  | { type: "note"; text: string };

/**
 * Section 3 — a filmstrip that travels horizontally as you scroll vertically.
 * The frame nearest the centre comes into focus (scales up, neighbours soften)
 * and the background drifts through blue → pink → ivory. On phones the heavy
 * pinning is dropped for a calm vertical stack that tells the same story.
 */
export function FilmstripGallery() {
  const reduced = useReducedMotion();
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  const photos = birthdayConfig.photos;
  // Weave the photos together with a couple of negative-space message panels.
  const panels: Panel[] = [];
  photos.forEach((_, i) => {
    panels.push({ type: "photo", index: i });
    if (i === 1) panels.push({ type: "note", text: "Every frame, a little louder." });
    if (i === 3) panels.push({ type: "note", text: "Roll the next memory…" });
  });

  useEffect(() => {
    const el = section.current;
    const tk = track.current;
    if (!el || !tk) return;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    const ctx = gsap.context(() => {
      if (reduced) return;

      if (isMobile) {
        // Calm vertical reveals, no pin, no horizontal travel.
        gsap.utils.toArray<HTMLElement>(".film-panel").forEach((p) => {
          gsap.from(p, {
            opacity: 0,
            y: 40,
            duration: 0.6,
            scrollTrigger: { trigger: p, start: "top 85%" },
          });
        });
        return;
      }

      const distance = () => tk.scrollWidth - window.innerWidth;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => `+=${distance() + window.innerHeight}`,
          scrub: 1,
          pin: ".film-stage",
          anticipatePin: 1,
          invalidateOnRefresh: true,
          // Stacked-pin refresh order (see FirstMemoryReveal); below reveal.
          refreshPriority: 20,
        },
      });

      tl.to(tk, { x: () => -distance(), ease: "none" }, 0);

      // Background colour drift across the chapter.
      tl.to(
        ".film-stage",
        { backgroundColor: birthdayConfig.colors.pink, ease: "none" },
        0
      )
        .to(
          ".film-stage",
          { backgroundColor: birthdayConfig.colors.ivory, ease: "none" },
          0.5
        )
        .to(
          ".film-stage",
          { backgroundColor: birthdayConfig.colors.electric, ease: "none" },
          0.85
        );

      // Focus the frame nearest centre; soften the rest.
      const onUpdate = () => {
        const cx = window.innerWidth / 2;
        gsap.utils.toArray<HTMLElement>(".film-frame").forEach((frame) => {
          const r = frame.getBoundingClientRect();
          const fc = r.left + r.width / 2;
          const dist = Math.min(1, Math.abs(fc - cx) / (window.innerWidth * 0.5));
          const focus = 1 - dist;
          gsap.set(frame, {
            scale: 0.9 + focus * 0.16,
            filter: `saturate(${0.5 + focus * 0.7}) blur(${(1 - focus) * 1.4}px)`,
          });
          const cap = frame.querySelector<HTMLElement>(".film-caption");
          if (cap) gsap.set(cap, { opacity: 0.25 + focus * 0.75 });
        });
      };
      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: () => `+=${distance() + window.innerHeight}`,
        onUpdate,
        onRefresh: onUpdate,
      });
    }, el);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={section}
      id="filmstrip"
      className="relative bg-electric"
      aria-label="A filmstrip of memories"
    >
      {/* overflow-hidden (which clips the horizontal pin bleed) must NOT apply
          on mobile or in reduced motion, where the track is a tall vertical
          column — otherwise it would clip the stacked frames. */}
      <div
        className={`film-stage relative flex min-h-[100svh] items-center bg-electric py-12 md:py-0 ${
          reduced ? "flex-col" : "md:overflow-hidden"
        }`}
      >
        <div
          ref={track}
          className={`film-track flex w-full flex-col gap-10 px-6 ${
            reduced
              ? ""
              : "md:w-auto md:flex-row md:items-center md:gap-16 md:px-[10vw]"
          }`}
        >
          <div className="film-panel hidden shrink-0 md:block md:w-[20vw]">
            <h2 className="font-display text-5xl leading-tight text-ivory lg:text-7xl">
              The film
              <br />
              of you.
            </h2>
            <p className="mt-3 font-hand text-2xl text-sunflower">
              keep scrolling →
            </p>
          </div>

          {panels.map((panel, i) =>
            panel.type === "note" ? (
              <div
                key={`note-${i}`}
                className="film-panel film-frame flex shrink-0 items-center justify-center md:w-[28vw]"
              >
                <p className="text-center font-display text-3xl leading-tight text-pink md:text-5xl">
                  {panel.text}
                </p>
              </div>
            ) : (
              <FilmFrame
                key={panel.index}
                index={panel.index}
                big={panel.index % 2 === 0}
              />
            )
          )}

          <div className="film-panel shrink-0 md:w-[16vw]">
            <p className="font-hand text-3xl text-sunflower">…to be continued</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function FilmFrame({ index, big }: { index: number; big: boolean }) {
  const p = birthdayConfig.photos[index];
  return (
    <figure
      className={`film-panel film-frame relative shrink-0 ${
        big ? "md:w-[34vw]" : "md:w-[26vw]"
      }`}
    >
      <div className="bg-ink p-2 shadow-paper">
        {/* film perforations */}
        <div className="flex justify-between px-1 pb-1">
          {Array.from({ length: 12 }).map((_, k) => (
            <span key={k} className="h-2 w-2 rounded-[2px] bg-ivory/70" />
          ))}
        </div>
        <PaperPhoto
          src={p.src}
          alt={p.alt}
          caption={p.caption}
          className={`w-full ${big ? "aspect-[5/4]" : "aspect-[4/5]"}`}
          seed={index}
        />
        <div className="flex justify-between px-1 pt-1">
          {Array.from({ length: 12 }).map((_, k) => (
            <span key={k} className="h-2 w-2 rounded-[2px] bg-ivory/70" />
          ))}
        </div>
      </div>
      <Star className="absolute -right-4 -top-4 h-7 w-7 text-sunflower" />
      <figcaption className="film-caption mt-3 max-w-[34vw] font-hand text-2xl text-ivory md:text-3xl">
        <span className="mr-2 font-condensed text-base tracking-[0.2em] text-sunflower">
          {p.date}
        </span>
        {p.caption}
      </figcaption>
    </figure>
  );
}
