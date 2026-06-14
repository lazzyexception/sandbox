import { useSound } from "../context/SoundContext";

/**
 * A small floating music control styled as a spinning record sticker. The
 * romantic soundtrack plays by default (once the page is first touched), so
 * this is simply a tasteful mute / unmute toggle — not a "turn it on" prompt.
 * If no soundtrack is configured the control never appears.
 */
export function SoundController({ ready }: { ready: boolean }) {
  const { available, playing, mute } = useSound();
  if (!available || !ready) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[120]">
      <button
        type="button"
        onClick={mute}
        aria-pressed={!playing}
        aria-label={playing ? "Mute the music" : "Play the music"}
        className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-sunflower text-ink shadow-paper transition-transform hover:scale-105 active:scale-95 sm:h-14 sm:w-14"
      >
        <span
          className={`absolute inset-1 rounded-full border-4 border-dashed border-ink/30 ${
            playing ? "animate-spin" : ""
          }`}
          style={{ animationDuration: "3s" }}
        />
        <span className="relative text-xl">{playing ? "♪" : "🔇"}</span>
      </button>
    </div>
  );
}
