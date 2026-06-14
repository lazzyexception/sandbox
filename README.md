# For Anjali — An Interactive Birthday Film 🎂

A single-page, scroll-driven birthday experience built for **Anjali Singh**,
made by **Satyam Singh**. Not a card, not a template — an interactive digital
birthday film: an opening that tears open like wrapping paper, a hero in the
spirit of an editorial cover, photographs that develop, orbit and fly through a
filmstrip, kinetic typography, a wall of little things to open, a handwritten
letter, a gift box that becomes a cake you blow out, and a confetti finale with
a printable keepsake.

> The whole experience is explored by **scrolling and interaction** — there is
> no navbar, no menu, no header by design.

## Tech

- **Vite + React 18 + TypeScript**
- **Tailwind CSS** (custom palette + paper textures)
- **GSAP + ScrollTrigger** for the principal scroll choreography (pinning,
  scrubbing, horizontal travel, orbit)
- **Framer Motion** for small micro-interactions
- **Canvas** confetti/firework engine for the celebration (no heavy 3D)
- Mobile-first, accessible, `prefers-reduced-motion` aware

## Run it

```bash
npm install
npm run dev      # open the printed http://localhost:5173 URL
```

Build for production / preview:

```bash
npm run build    # type-checks then builds to /dist
npm run preview  # serves the production build locally
```

Deploy by dropping the `dist/` folder onto any static host (Netlify, Vercel,
GitHub Pages, …). `base` is relative, so it also works from a sub-path.

## Make it yours

Everything personal lives in **one file**: [`src/data/birthdayConfig.ts`](src/data/birthdayConfig.ts).
Names, dates, the headline, the letter, personality traits, captions, colours,
the hidden notes and which photos appear — all editable there without touching a
line of animation code.

### Photos

Place images in **`public/Pics/`** named `Main1`, `slider1`, `slider2`, … (see
[`public/Pics/README.md`](public/Pics/README.md)). The loader auto-detects
`.webp / .jpg / .jpeg / .png`, lazy-loads everything past the hero, and shows a
designed placeholder for any photo not added yet — so it never looks broken.

### Music

Optional. Drop `public/audio/soundtrack.mp3` (see
[`public/audio/README.md`](public/audio/README.md)). The control is **off by
default**, pauses when the tab is hidden, and has a visible mute/stop.

## The story (sections)

| #   | Component               | What happens                                              |
| --- | ----------------------- | -------------------------------------------------------- |
| 0   | `OpeningSequence`       | Spotlight dot → handwritten line → paper tears open      |
| 1   | `BirthdayHero`          | Editorial hero, paper-cut portrait, magnetic CTA         |
| 2   | `FirstMemoryReveal`     | A photo develops; memories fan into a scrapbook          |
| 3   | `FilmstripGallery`      | Horizontal filmstrip driven by vertical scroll           |
| 4   | `OrbitingMemories`      | Photos orbit a portrait, then collapse into a flame      |
| 5   | `KineticTraits`         | Seven phrases, seven different kinetic behaviours         |
| 6   | `InteractiveMemoryWall` | Envelopes / folds / tags / stickers / scratch to open    |
| 7   | `PersonalLetter`        | Calm ivory letter, revealed paragraph by paragraph       |
| 8   | `DigitalGift`           | Gift opens → night sky → cake → blow out the candles     |
| 9   | `FinalCelebration`      | Headline, confetti, replay + printable keepsake card     |

Plus `SoundController`, `StoryProgress` (a star-trail + balloon), and
`ReducedMotionFallback`.

## Accessibility & performance

- Respects `prefers-reduced-motion`: parallax/scrubbing off, orbit becomes a
  static captioned grid, transitions shortened — **all content is retained**.
- Every photo has alt text; controls are keyboard operable with visible focus.
- Animations use transforms/opacity; particle loops stop when idle; images are
  lazy-loaded with reserved dimensions to avoid layout shift.
- The microphone candle option is **opt-in** and always has a press-and-hold
  (and keyboard) alternative.
- Works without JavaScript animation — the words and photos are still there.

---

Made with love. 🎈
