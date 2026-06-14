import { useMemo, useState } from "react";

/* The order we probe extensions in. WebP/AVIF first for performance. */
const EXTENSIONS = [".avif", ".webp", ".jpg", ".jpeg", ".png", ".JPG", ".PNG"];

type Props = {
  /** Base path with no extension, e.g. "/Pics/Main1". */
  src: string;
  alt: string;
  caption?: string;
  className?: string;
  imgClassName?: string;
  /** Duotone the image toward the brand palette (editorial portrait look). */
  duotone?: boolean;
  /** Loading strategy — hero portrait should be eager, the rest lazy. */
  eager?: boolean;
  /** A stable seed so the placeholder gradient is varied but deterministic. */
  seed?: number;
};

/**
 * PaperPhoto renders a photograph and *guarantees* it never shows a broken
 * image: if the file is missing it walks through candidate extensions and,
 * if all fail, draws a designed paper-cut placeholder that still carries the
 * caption. This is what keeps the site looking intentional before the real
 * photos are dropped into /public/Pics.
 */
export function PaperPhoto({
  src,
  alt,
  caption,
  className = "",
  imgClassName = "",
  duotone = false,
  eager = false,
  seed = 0,
}: Props) {
  const [extIndex, setExtIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  const url = useMemo(() => src + EXTENSIONS[extIndex], [src, extIndex]);

  const onError = () => {
    if (extIndex < EXTENSIONS.length - 1) {
      setExtIndex((i) => i + 1);
    } else {
      setFailed(true);
    }
  };

  if (failed) {
    return (
      <Placeholder
        alt={alt}
        caption={caption}
        className={className}
        seed={seed}
      />
    );
  }

  return (
    <figure className={`relative overflow-hidden ${className}`}>
      <img
        src={url}
        alt={alt}
        onError={onError}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        className={`h-full w-full select-none object-cover ${
          duotone ? "anjali-duotone" : ""
        } ${imgClassName}`}
      />
      {caption && <figcaption className="sr-only">{caption}</figcaption>}
    </figure>
  );
}

/* A deterministic, on-brand placeholder so missing photos still look styled. */
function Placeholder({
  alt,
  caption,
  className,
  seed,
}: {
  alt: string;
  caption?: string;
  className?: string;
  seed: number;
}) {
  const palettes = [
    ["#342FD4", "#B9A8FF"],
    ["#FF2B91", "#FFC400"],
    ["#FFC400", "#FF2B91"],
    ["#B9A8FF", "#342FD4"],
  ];
  const [a, b] = palettes[seed % palettes.length];
  const initial = (alt.trim()[0] || "♥").toUpperCase();

  return (
    <figure
      role="img"
      aria-label={alt}
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}
    >
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 h-full w-full opacity-30"
        aria-hidden="true"
      >
        <circle cx="100" cy="78" r="42" fill="#FFF8E8" />
        <path d="M30 200 Q100 110 170 200 Z" fill="#FFF8E8" />
      </svg>
      <span className="relative z-10 font-display text-5xl text-ivory drop-shadow">
        {initial}
      </span>
      {caption && (
        <figcaption className="absolute bottom-2 left-2 right-2 z-10 text-center font-hand text-sm text-ivory/90">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
