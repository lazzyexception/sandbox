import { useCallback, useEffect, useState } from "react";
import { ScrollTrigger } from "./lib/gsapSetup";
import { SoundProvider } from "./context/SoundContext";
import { ReducedMotionFallback } from "./components/ReducedMotionFallback";
import { OpeningSequence } from "./components/OpeningSequence";
import { BirthdayHero } from "./components/BirthdayHero";
import { FirstMemoryReveal } from "./components/FirstMemoryReveal";
import { FilmstripGallery } from "./components/FilmstripGallery";
import { OrbitingMemories } from "./components/OrbitingMemories";
import { KineticTraits } from "./components/KineticTraits";
import { InteractiveMemoryWall } from "./components/InteractiveMemoryWall";
import { PersonalLetter } from "./components/PersonalLetter";
import { DigitalGift } from "./components/DigitalGift";
import { FinalCelebration } from "./components/FinalCelebration";
import { SoundController } from "./components/SoundController";
import { StoryProgress } from "./components/StoryProgress";

export default function App() {
  // `runKey` remounts the whole story for a clean "Replay" reset.
  const [runKey, setRunKey] = useState(0);
  const [introDone, setIntroDone] = useState(false);
  const [wishDone, setWishDone] = useState(false);

  // Recalculate pinned/scrubbed triggers once everything has settled.
  // CRITICAL: the opening sequence locks the body to `height: 100vh` while it
  // plays, so any refresh during that window measures a one-screen-tall document
  // and computes every pin position wrong. We therefore refresh only AFTER the
  // opening finishes (introDone) and the body height is restored — plus a few
  // extra settle points for fonts and late image layout.
  useEffect(() => {
    if (!introDone) return;
    const refresh = () => ScrollTrigger.refresh();
    const raf = requestAnimationFrame(() => requestAnimationFrame(refresh));
    const timers = [100, 600, 1500].map((ms) => window.setTimeout(refresh, ms));
    if (document.fonts?.ready) document.fonts.ready.then(refresh);
    window.addEventListener("load", refresh);
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(window.clearTimeout);
      window.removeEventListener("load", refresh);
    };
  }, [runKey, introDone]);

  const handleWish = useCallback(() => {
    setWishDone(true);
    window.setTimeout(() => {
      document
        .getElementById("finale")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 80);
  }, []);

  const handleReplay = useCallback(() => {
    setWishDone(false);
    setIntroDone(false);
    window.scrollTo({ top: 0, behavior: "auto" });
    // Remount everything so internal section state and triggers reset cleanly.
    setRunKey((k) => k + 1);
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, []);

  return (
    <SoundProvider>
      <ReducedMotionFallback>
        {!introDone && <OpeningSequence onDone={() => setIntroDone(true)} />}

        <main key={runKey} className="relative">
          <BirthdayHero play={introDone} />
          <FirstMemoryReveal />
          <FilmstripGallery />
          <OrbitingMemories />
          <KineticTraits />
          <InteractiveMemoryWall />
          <PersonalLetter />
          <DigitalGift onWishComplete={handleWish} />
          <FinalCelebration visible={wishDone} onReplay={handleReplay} />
        </main>

        <SoundController ready={introDone} />
        <StoryProgress ready={introDone} />
      </ReducedMotionFallback>
    </SoundProvider>
  );
}
