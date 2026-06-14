import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useSound } from "../context/SoundContext";
import { birthdayConfig, type HiddenNote } from "../data/birthdayConfig";
import { PaperPhoto } from "./PaperPhoto";
import { Star, Flower } from "./Doodles";

/**
 * Section 6 — a pin-board of little things to open. Each item has its own
 * physical interaction (envelope, fold, flip-tag, peel-sticker, scratch,
 * develop). Opening is optional and sticky: once open it stays open. Items are
 * real buttons, fully keyboard operable, and only make a sound if the visitor
 * turned sound on.
 */
export function InteractiveMemoryWall() {
  const reduced = useReducedMotion();
  const { playing, cue } = useSound();
  const [open, setOpen] = useState<Set<number>>(new Set());
  const notes = birthdayConfig.hiddenNotes;

  const toggle = (i: number, kind: HiddenNote["kind"]) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (!next.has(i)) {
        next.add(i); // opened items stay open
        if (playing) cue(kind === "develop" ? "sparkle" : "pop");
      }
      return next;
    });
  };

  return (
    <section
      id="wall"
      className="relative overflow-hidden bg-pink py-24"
      aria-label="A wall of little surprises to open"
    >
      <Flower className="pointer-events-none absolute -left-6 top-10 h-24 w-24 text-sunflower/60" />
      <Star className="pointer-events-none absolute right-10 top-16 h-10 w-10 text-ivory/70" />

      <div className="mx-auto max-w-5xl px-6">
        <h2 className="mb-3 text-center font-display text-5xl text-ivory md:text-7xl">
          Open me.
        </h2>
        <p className="mb-12 text-center font-hand text-2xl text-ink">
          (you don’t have to open them all — but you’ll want to)
        </p>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note, i) => (
            <WallItem
              key={i}
              note={note}
              index={i}
              opened={open.has(i)}
              reduced={reduced}
              onToggle={() => toggle(i, note.kind)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function WallItem({
  note,
  index,
  opened,
  reduced,
  onToggle,
}: {
  note: HiddenNote;
  index: number;
  opened: boolean;
  reduced: boolean;
  onToggle: () => void;
}) {
  const photo = birthdayConfig.photos[index % birthdayConfig.photos.length];
  const dur = reduced ? 0 : 0.45;
  const rot = [-3, 2, -2, 3, -1, 2][index % 6];

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={opened}
      aria-label={`${note.title}. ${opened ? note.message : "Press to open."}`}
      className="group relative block min-h-[180px] w-full rounded-md bg-ivory p-5 text-left text-ink shadow-paper transition-transform duration-200 hover:-translate-y-1 focus-visible:-translate-y-1"
      style={{ rotate: `${rot}deg` }}
    >
      {/* Title strip / tag */}
      <span className="font-condensed text-sm tracking-[0.25em] text-pink">
        {note.title.toUpperCase()}
      </span>

      {/* Closed-state ornament per kind */}
      {!opened && <ClosedFace kind={note.kind} />}

      {/* Revealed content */}
      <AnimatePresence>
        {opened && (
          <motion.div
            initial={revealInitial(note.kind, reduced)}
            animate={{ opacity: 1, rotateX: 0, rotateY: 0, scaleY: 1, y: 0 }}
            transition={{ duration: dur, ease: "easeOut" }}
            className="mt-3 origin-top"
          >
            {note.kind === "develop" ? (
              <div className="flex items-center gap-3">
                <div className="paper-edge h-20 w-20 shrink-0">
                  <PaperPhoto
                    src={photo.src}
                    alt={photo.alt}
                    className="h-full w-full"
                    seed={index}
                  />
                </div>
                <p className="font-hand text-xl leading-snug">{note.message}</p>
              </div>
            ) : (
              <p className="font-hand text-xl leading-snug">{note.message}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!opened && (
        <span className="pointer-events-none absolute bottom-3 right-4 font-hand text-lg text-ink/50">
          {hint(note.kind)}
        </span>
      )}
    </button>
  );
}

function revealInitial(kind: HiddenNote["kind"], reduced: boolean) {
  if (reduced) return { opacity: 1 };
  switch (kind) {
    case "envelope":
      return { opacity: 0, y: 24 };
    case "fold":
      return { opacity: 0, scaleY: 0.1 };
    case "tag":
      return { opacity: 0, rotateY: 90 };
    case "sticker":
      return { opacity: 0, rotateX: -80 };
    case "scratch":
      return { opacity: 0 };
    case "develop":
      return { opacity: 0, scale: 0.9 };
    default:
      return { opacity: 0 };
  }
}

function hint(kind: HiddenNote["kind"]) {
  const map: Record<HiddenNote["kind"], string> = {
    envelope: "open ✉",
    fold: "unfold",
    tag: "flip",
    sticker: "peel",
    scratch: "scratch",
    develop: "shake",
  };
  return map[kind];
}

/* A small decorative "closed" graphic that suits each interaction type. */
function ClosedFace({ kind }: { kind: HiddenNote["kind"] }) {
  const base = "mt-4 flex h-24 items-center justify-center rounded";
  switch (kind) {
    case "envelope":
      return (
        <div className={`${base} bg-lavender/40`}>
          <svg viewBox="0 0 80 56" className="h-14 w-20 text-electric" aria-hidden>
            <rect x="2" y="2" width="76" height="52" rx="4" fill="#FFF8E8" stroke="currentColor" strokeWidth="3" />
            <path d="M3 5 L40 32 L77 5" fill="none" stroke="currentColor" strokeWidth="3" />
          </svg>
        </div>
      );
    case "fold":
      return (
        <div className={`${base} bg-sunflower/40`}>
          <div className="h-12 w-20 rounded-sm bg-ivory shadow-inner ring-1 ring-ink/20" />
        </div>
      );
    case "tag":
      return (
        <div className={`${base} bg-electric/20`}>
          <div className="relative h-14 w-24 rotate-[-6deg] rounded-md bg-electric">
            <span className="absolute left-2 top-2 h-2 w-2 rounded-full bg-ivory" />
          </div>
        </div>
      );
    case "sticker":
      return (
        <div className={`${base} bg-pink/20`}>
          <div className="h-16 w-16 rounded-full bg-sunflower shadow-paper-sm" />
        </div>
      );
    case "scratch":
      return (
        <div className={`${base} bg-ink`}>
          <span className="font-condensed text-sm tracking-[0.3em] text-sunflower">
            SCRATCH HERE
          </span>
        </div>
      );
    case "develop":
      return (
        <div className={`${base} bg-ink/80`}>
          <span className="font-condensed text-xs tracking-[0.3em] text-ivory/70">
            DEVELOPING…
          </span>
        </div>
      );
    default:
      return null;
  }
}
