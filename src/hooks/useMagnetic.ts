import { useEffect, useRef } from "react";
import { useReducedMotion } from "./useReducedMotion";

/**
 * Magnetic hover for desktop pointers: the element drifts toward the cursor
 * while it hovers nearby, then springs back. Coarse pointers (touch) and
 * reduced-motion users get a plain, tactile button instead.
 */
export function useMagnetic<T extends HTMLElement>(strength = 0.4) {
  const ref = useRef<T>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let raf = 0;
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
    };
    const reset = () => {
      cancelAnimationFrame(raf);
      el.style.transform = "translate(0,0)";
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", reset);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", reset);
    };
  }, [reduced, strength]);

  return ref;
}
