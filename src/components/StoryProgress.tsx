import { useEffect, useRef } from "react";

const DOTS = 7;

/**
 * A thematic, non-interactive progress indicator: a vertical dotted trail of
 * stars on the screen edge that light up as the story is read, with a tiny
 * balloon riding the current position. No numbers, no scrubber, no chrome.
 * Updates are rAF-throttled and touch only transform/opacity.
 */
export function StoryProgress({ ready }: { ready: boolean }) {
  const balloon = useRef<HTMLDivElement>(null);
  const stars = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    if (!ready) return;
    let raf = 0;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (balloon.current) {
        balloon.current.style.transform = `translateY(${p * 100}%)`;
      }
      stars.current.forEach((s, i) => {
        if (!s) return;
        const lit = p >= i / (DOTS - 1) - 0.001;
        s.style.opacity = lit ? "1" : "0.25";
        s.style.transform = lit ? "scale(1)" : "scale(0.7)";
      });
      raf = 0;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [ready]);

  if (!ready) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed right-3 top-1/2 z-[110] hidden -translate-y-1/2 sm:block"
    >
      <div className="relative flex h-56 flex-col items-center justify-between">
        {/* dotted trail */}
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 border-l border-dashed border-ivory/40" />
        {Array.from({ length: DOTS }).map((_, i) => (
          <span
            key={i}
            ref={(el) => (stars.current[i] = el)}
            className="relative text-sunflower transition-all duration-300"
            style={{ opacity: 0.25 }}
          >
            ★
          </span>
        ))}
        {/* rising balloon marker */}
        <div
          ref={balloon}
          className="absolute left-1/2 top-0 -translate-x-1/2"
          style={{ willChange: "transform" }}
        >
          <span className="text-lg">🎈</span>
        </div>
      </div>
    </div>
  );
}
