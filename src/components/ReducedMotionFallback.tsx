import { useEffect } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";

/**
 * Reflects the reduced-motion preference onto <html data-motion> so CSS/devtools
 * can see it, and renders children unchanged. Each section reads the same hook
 * to swap cinematic choreography for calm, static, fully-captioned layouts —
 * so reduced-motion visitors lose the spectacle but never the story.
 */
export function ReducedMotionFallback({
  children,
}: {
  children: React.ReactNode;
}) {
  const reduced = useReducedMotion();
  useEffect(() => {
    document.documentElement.dataset.motion = reduced ? "reduced" : "full";
  }, [reduced]);
  return <>{children}</>;
}
