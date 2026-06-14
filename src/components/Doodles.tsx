/* Hand-drawn-feeling decorations. Imperfect on purpose — slightly off, a touch
   wobbly — so the page reads as handmade rather than vector-perfect. Each takes
   a className for sizing/colour and inherits `currentColor`. */

export function Star({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <path
        d="M50 6 C54 34 66 46 94 50 C66 54 54 66 50 94 C46 66 34 54 6 50 C34 46 46 34 50 6 Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Cross({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <path
        d="M50 8 L56 44 L92 50 L56 56 L50 92 L44 56 L8 50 L44 44 Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Flower({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <g fill="currentColor">
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <ellipse
            key={deg}
            cx="50"
            cy="26"
            rx="13"
            ry="22"
            transform={`rotate(${deg} 50 50)`}
          />
        ))}
      </g>
      <circle cx="50" cy="50" r="12" fill="#17131F" />
    </svg>
  );
}

export function Squiggle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 40" className={className} aria-hidden="true">
      <path
        d="M4 20 Q24 2 44 20 T84 20 T124 20 T164 20 T196 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function GridMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 60" className={className} aria-hidden="true">
      <g stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <line x1="30" y1="6" x2="30" y2="54" />
        <line x1="6" y1="30" x2="54" y2="30" />
      </g>
    </svg>
  );
}

export function Blob({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M44 -64 C62 -52 73 -31 76 -9 C79 13 73 36 58 53 C43 70 19 81 -6 80 C-31 79 -57 66 -71 46 C-85 26 -86 -1 -77 -25 C-68 -49 -49 -70 -26 -77 C-3 -84 26 -76 44 -64 Z"
        transform="translate(100 100)"
      />
    </svg>
  );
}
