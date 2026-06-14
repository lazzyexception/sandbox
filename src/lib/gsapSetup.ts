import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/* Register the plugin once for the whole app. Importing this module is enough. */
gsap.registerPlugin(ScrollTrigger);

/* A little organic elastic ease we reuse for "placed by hand" overshoots. */
export const handPlaced = "elastic.out(1, 0.6)";

// Dev-only: expose for live inspection in the preview/devtools.
if (import.meta.env.DEV) {
  (window as unknown as Record<string, unknown>).ScrollTrigger = ScrollTrigger;
  (window as unknown as Record<string, unknown>).gsap = gsap;
}

export { gsap, ScrollTrigger };
