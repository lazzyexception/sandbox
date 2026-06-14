/* =============================================================================
   birthdayConfig.ts
   -----------------------------------------------------------------------------
   THIS is the only file you ever need to touch to personalise the experience.
   Names, dates, messages, photographs, captions and colours all live here.
   No animation code reads hard-coded text — it all flows from this object.

   Want to reuse this for another person? Change the fields below and you are
   done. See README.md → "Make it yours" for the photo-naming convention.
============================================================================= */

export type Photo = {
  /** Path WITHOUT extension, e.g. "/Pics/Main1". The loader tries
   *  .webp / .jpg / .jpeg / .png automatically and falls back to a
   *  designed placeholder if the file is not there yet. */
  src: string;
  alt: string;
  caption: string;
  date: string;
  featured?: boolean;
};

export type HiddenNote = {
  title: string;
  /** Visual treatment of the interactive item on the memory wall. */
  kind: "envelope" | "fold" | "tag" | "sticker" | "scratch" | "develop";
  message: string;
};

export type BirthdayConfig = {
  personName: string;
  nickname: string;
  birthdayDate: string;
  birthdayDateLabel: string;
  creatorName: string;
  creatorRelationship: string;
  heroTitle: [string, string];
  openingLine: string;
  scrollHint: string;
  beginLabel: string;
  /** Audio file placed in /public/audio/. Leave "" to hide the toggle. */
  soundtrack: string;
  soundtrackLabel: string;
  firstRevealIntro: string;
  finalHeadline: [string, string];
  finalWish: string[];
  finalMessage: string[];
  letterSalutation: string;
  letterSignoff: string;
  personalityTraits: string[];
  photos: Photo[];
  hiddenNotes: HiddenNote[];
  /** Off by default per the brief. Set true to expose a share action. */
  enableSharing: boolean;
  colors: {
    electric: string;
    pink: string;
    sunflower: string;
    ivory: string;
    ink: string;
    lavender: string;
  };
};

export const birthdayConfig: BirthdayConfig = {
  personName: "Anjali Singh",
  nickname: "Anjali",
  birthdayDate: "2026-06-15",
  birthdayDateLabel: "15 JUNE",
  creatorName: "Satyam Singh",
  creatorRelationship: "Forever Yours",

  heroTitle: ["Today Is", "Anjali’s Day"],
  openingLine: "The love of my life was born today…",
  scrollHint: "Scroll gently, my love. Our story is waiting.",
  beginLabel: "Begin the Surprise",

  // Romantic background music. Plays softly by default once the page is
  // touched (browsers block sound before any interaction). Drop your file at
  // /public/audio/soundtrack.mp3. Set "" to disable music entirely.
  soundtrack: "audio/soundtrack.mp3",
  soundtrackLabel: "Birthday soundtrack",

  firstRevealIntro:
    "Before today became ours, there were a thousand little moments…",

  finalHeadline: ["Happy Birthday,", "My Love"],
  finalWish: [
    "May this year hold you",
    "as gently as I want to,",
    "fill you with everything you dream of,",
    "and give us a thousand more",
    "memories to fall in love over.",
  ],

  // Section 7 — the letter. Each entry is one paragraph.
  letterSalutation: "My dearest Anjali,",
  finalMessage: [
    "Of all the ordinary days I have lived, the luckiest one was the day you walked into my life and decided to stay. Somewhere between your laughter and your chaos, you quietly became my favourite person, my home, my every reason to smile.",
    "I love the way you scrunch your nose, the way you tell the same story with more drama every time, the way you fall asleep mid-sentence, and the way you love me even on the days I forget to deserve it. You are, simply, the most beautiful thing that ever happened to me.",
    "Today the whole world gets to celebrate you — but I get to love you, every single day after. Thank you for being mine. I promise to keep choosing you, in this life and any other.",
    "Happy Birthday, my love. Happy Birthday, Anjaliii. ♥",
  ],
  letterSignoff: "Forever and always yours,",

  // Section 5 — kinetic typography. Edit freely; the layout adapts.
  personalityTraits: [
    "That smile of yours.",
    "The way you love.",
    "Your beautiful chaos.",
    "Your dramatic stories.",
    "The way you hold my hand.",
    "Every little thing you do.",
    "Us, against the whole world.",
  ],

  // The FIRST featured photo is the hero portrait. "Home" is the main one.
  // Files live in /public/Pics as Main1, slider1, slider2, …
  photos: [
    {
      src: "Pics/Main1",
      alt: "Anjali — my favourite person",
      caption: "The smile I fell for.",
      date: "My favourite view",
      featured: true,
    },
    {
      src: "Pics/slider1",
      alt: "A candid moment of us together",
      caption: "The laugh I could never get enough of.",
      date: "One golden afternoon",
    },
    {
      src: "Pics/slider2",
      alt: "A memorable day out together",
      caption: "The day everything felt perfect.",
      date: "That little adventure",
    },
    {
      src: "Pics/slider3",
      alt: "A warm moment with Anjali",
      caption: "Still my favourite memory.",
      date: "A quiet evening",
    },
    {
      src: "Pics/slider4",
      alt: "Anjali being effortlessly herself",
      caption: "Just you, being perfectly you.",
      date: "Any given day",
    },
    {
      src: "Pics/slider5",
      alt: "Anjali mid-story, full of life",
      caption: "Mid-story, eyes shining — as always.",
      date: "Every time we talk",
    },
    {
      src: "Pics/slider6",
      alt: "A tender moment together",
      caption: "My whole world in one frame.",
      date: "Us",
    },
    {
      src: "Pics/slider7",
      alt: "Anjali glowing",
      caption: "The most beautiful, always.",
      date: "Forever",
    },
  ],

  // Section 6 — interactive memory wall. 5–8 items recommended.
  hiddenNotes: [
    {
      title: "Open me first",
      kind: "envelope",
      message:
        "Happy Birthday, my love. I made this whole little world just for you — because you deserve to be celebrated loudly.",
    },
    {
      title: "A tiny confession",
      kind: "fold",
      message:
        "I fall a little more in love with you every single day. Even on the boring ones. Especially on the boring ones.",
    },
    {
      title: "Our little secret",
      kind: "tag",
      message:
        "You already know the one. No, I am not typing it here. Yes, I am grinning like an idiot.",
    },
    {
      title: "Peel me",
      kind: "sticker",
      message:
        "You are my favourite hello and my hardest goodbye. Thank you for being mine.",
    },
    {
      title: "Scratch to reveal",
      kind: "scratch",
      message: "You make ordinary days feel like the best days of my life.",
    },
    {
      title: "Shake to develop",
      kind: "develop",
      message: "Every memory with you only gets more beautiful with time. Like this one.",
    },
  ],

  enableSharing: false,

  colors: {
    electric: "#342FD4",
    pink: "#FF2B91",
    sunflower: "#FFC400",
    ivory: "#FFF8E8",
    ink: "#17131F",
    lavender: "#B9A8FF",
  },
};
