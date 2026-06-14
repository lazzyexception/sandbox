import { useEffect, useRef } from "react";
import { useReducedMotion } from "./useReducedMotion";

/**
 * Subtle pointer (and device-tilt) parallax. Returns a ref you attach to a
 * container; any descendant carrying `data-parallax="<depth>"` is offset by
 * depth * pointer-delta. Depth is a small number — 1 ≈ background, 6 ≈ close
 * foreground. Movement is smoothed with requestAnimationFrame and disabled
 * entirely for reduced-motion users.
 */
export function usePointerParallax<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    const targets = Array.from(
      el.querySelectorAll<HTMLElement>("[data-parallax]")
    ).map((node) => ({
      node,
      depth: parseFloat(node.dataset.parallax || "1"),
    }));
    if (!targets.length) return;

    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;
    let raf = 0;

    const tick = () => {
      curX += (targetX - curX) * 0.08;
      curY += (targetY - curY) * 0.08;
      for (const t of targets) {
        t.node.style.transform = `translate3d(${curX * t.depth}px, ${
          curY * t.depth
        }px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };

    const onPointer = (e: PointerEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      targetX = ((e.clientX - cx) / cx) * 14;
      targetY = ((e.clientY - cy) / cy) * 14;
    };

    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      targetX = Math.max(-14, Math.min(14, (e.gamma / 45) * 14));
      targetY = Math.max(-14, Math.min(14, (e.beta / 45) * 14));
    };

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("deviceorientation", onTilt, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("deviceorientation", onTilt);
    };
  }, [reduced]);

  return ref;
}
