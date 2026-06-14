import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "../lib/gsapSetup";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { birthdayConfig } from "../data/birthdayConfig";
import { PaperPhoto } from "./PaperPhoto";
import { Star, Cross } from "./Doodles";

/* Each supporting memory is dealt out as a different physical object. */
const FORMS = ["polaroid", "film", "torn", "contact", "fold"] as const;
type Form = (typeof FORMS)[number];

/* Loose, hand-placed scrapbook targets (percent of the stage). */
const SCATTER = [
  { x: -30, y: -14, r: -8 },
  { x: 30, y: -8, r: 7 },
  { x: -26, y: 20, r: 6 },
  { x: 28, y: 22, r: -6 },
  { x: 0, y: 30, r: -3 },
];

export function FirstMemoryReveal() {
  const reduced = useReducedMotion();
  const section = useRef<HTMLDivElement>(null);
  const photos = birthdayConfig.photos;
  const central = photos.find((p) => p.featured) ?? photos[0];
  const rest = photos.filter((p) => p !== central).slice(0, 5);

  useEffect(() => {
    const el = section.current;
    if (!el || reduced) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "+=240%",
          scrub: 1,
          pin: ".reveal-stage",
          anticipatePin: 1,
          // Stacked pins must refresh top-of-page first so each one's spacer is
          // counted by the sections below it. Higher number = refreshes earlier.
          refreshPriority: 30,
        },
      });

      tl.to(".reveal-intro", { opacity: 0, y: -40 }, 0.04)
        // central photo develops from blurred monochrome into colour
        .to(".reveal-cover", { opacity: 0, duration: 0.4 }, 0.05)
        .from(".reveal-date", { opacity: 0, y: 16 }, 0.18)
        .to(".reveal-central", { scale: 0.82, duration: 0.5 }, 0.2);

      // each supporting photo slides out from behind into its scrapbook spot
      rest.forEach((_, i) => {
        const t = SCATTER[i % SCATTER.length];
        tl.fromTo(
          `.memory-card-${i}`,
          { xPercent: 0, yPercent: 0, rotate: 0, opacity: 0, scale: 0.6 },
          {
            xPercent: t.x,
            yPercent: t.y,
            rotate: t.r,
            opacity: 1,
            scale: 1,
            ease: "power2.out",
          },
          0.3 + i * 0.12
        );
      });
    }, el);

    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, [reduced, rest]);

  return (
    <section
      ref={section}
      id="first-reveal"
      className="relative bg-electric"
      aria-label="The first memories"
    >
      <div className="reveal-stage relative flex min-h-[100svh] items-center justify-center overflow-hidden">
        {/* Intro line */}
        <p className="reveal-intro absolute left-1/2 top-[12%] z-40 w-[88%] max-w-2xl -translate-x-1/2 text-center font-display text-2xl leading-snug text-ivory sm:text-3xl md:text-4xl">
          {birthdayConfig.firstRevealIntro}
        </p>

        {/* Stage */}
        <div className="relative h-[70svh] w-full max-w-4xl">
          {/* Supporting memories (behind, fan out on scroll). In reduced
              motion they are simply pre-scattered. */}
          {rest.map((p, i) => {
            const t = SCATTER[i % SCATTER.length];
            const reducedStyle = reduced
              ? {
                  transform: `translate(${t.x}%, ${t.y}%) rotate(${t.r}deg)`,
                }
              : undefined;
            return (
              <div
                key={p.src}
                className={`memory-card-${i} absolute left-1/2 top-1/2 z-10 w-[44vw] max-w-[230px] -translate-x-1/2 -translate-y-1/2`}
                style={reducedStyle}
              >
                <PhysicalPhoto photo={p} form={FORMS[i % FORMS.length]} seed={i + 1} />
              </div>
            );
          })}

          {/* Central photo */}
          <div className="reveal-central absolute left-1/2 top-1/2 z-20 w-[60vw] max-w-[320px] -translate-x-1/2 -translate-y-1/2">
            <div className="paper-edge relative rotate-[-2deg]">
              <PaperPhoto
                src={central.src}
                alt={central.alt}
                caption={central.caption}
                className="aspect-[4/5] w-full"
                eager
                seed={0}
              />
              {/* Monochrome blurred cover that fades to reveal colour. Skipped
                  in reduced motion so the photo is simply shown in full. */}
              {!reduced && (
                <div className="reveal-cover pointer-events-none absolute inset-2 anjali-duotone backdrop-blur-md">
                  <PaperPhoto
                    src={central.src}
                    alt=""
                    duotone
                    className="h-full w-full blur-[3px]"
                    seed={0}
                  />
                </div>
              )}
            </div>
            <p className="reveal-date mt-3 text-center font-hand text-2xl text-sunflower">
              {central.date}
            </p>
            <Star className="absolute -right-7 -top-7 h-8 w-8 text-pink" />
            <Cross className="absolute -left-6 bottom-2 h-5 w-5 text-ivory" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* A single photo, styled as one of several physical print formats. */
function PhysicalPhoto({
  photo,
  form,
  seed,
}: {
  photo: { src: string; alt: string; caption: string; date: string };
  form: Form;
  seed: number;
}) {
  const img = (
    <PaperPhoto
      src={photo.src}
      alt={photo.alt}
      caption={photo.caption}
      duotone={form === "contact"}
      className="aspect-square w-full"
      seed={seed}
    />
  );

  if (form === "polaroid") {
    return (
      <figure className="rotate-1 bg-ivory p-2 pb-9 shadow-paper">
        {img}
        <figcaption className="absolute inset-x-2 bottom-2 text-center font-hand text-base text-ink">
          {photo.caption}
        </figcaption>
      </figure>
    );
  }
  if (form === "film") {
    return (
      <figure className="bg-ink p-1 shadow-paper">
        <div className="flex justify-between px-1 py-0.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="h-1.5 w-1.5 rounded-[1px] bg-ivory/80" />
          ))}
        </div>
        {img}
        <div className="flex justify-between px-1 py-0.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="h-1.5 w-1.5 rounded-[1px] bg-ivory/80" />
          ))}
        </div>
        <figcaption className="px-1 pb-1 pt-0.5 font-condensed text-xs tracking-widest text-ivory">
          {photo.caption}
        </figcaption>
      </figure>
    );
  }
  if (form === "torn") {
    return (
      <figure
        className="bg-ivory p-2 shadow-paper"
        style={{ clipPath: "polygon(0 4%,100% 0,98% 96%,2% 100%)" }}
      >
        {img}
        <figcaption className="pt-1 text-center font-hand text-base text-ink">
          {photo.caption}
        </figcaption>
      </figure>
    );
  }
  if (form === "contact") {
    return (
      <figure className="bg-ink p-2 shadow-paper ring-1 ring-ivory/30">
        {img}
        <figcaption className="pt-1 text-center font-condensed text-xs tracking-[0.2em] text-sunflower">
          {photo.caption}
        </figcaption>
      </figure>
    );
  }
  // fold
  return (
    <figure className="relative bg-ivory p-2 shadow-paper">
      <div className="absolute inset-x-0 top-1/2 h-px bg-ink/10" />
      {img}
      <figcaption className="pt-1 text-center font-hand text-base text-ink">
        {photo.caption}
      </figcaption>
    </figure>
  );
}
