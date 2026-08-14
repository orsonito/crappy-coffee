"use client";

import { useState } from "react";
import {
  CoffeeStoryProps,
  StoryEpisode,
  StoryEpisodeView,
} from "./coffeestory.types";

export const STORY_EPISODES: StoryEpisode[] = [
  {
    id: "ep-0",
    ep: 0,
    title: "The dubious machine",
    body: "You want a coffee from a shady machine. Maybe it’ll be fine — maybe not. You take the plunge: coffeeholic mode on. Let’s see what this thing pours.",
  },
  {
    id: "ep-1",
    ep: 1,
    title: "It actually worked",
    body: "Against all odds, the cup is hot, bitter, and drinkable. Good coffee. Your coffeeholic streak officially starts here.",
    unlockIcons: ["/assets/story/req-good-coffee.svg"],
    unlockCount: 1,
    unlockHint: "Get ×1 matching cup from the machine to unlock this episode.",
  },
  {
    id: "ep-2",
    ep: 2,
    title: "Something in the cup",
    body: "Weird stuff starts showing up in my coffee. Soft bean? Sugar lump? Spider leg… or a COCKROACH? Better keep pouring and find out what else this machine is hiding.",
    unlockIcons: [
      "/assets/story/req-good-coffee.svg",
      "/assets/story/req-question.svg",
    ],
    unlockCount: 1,
    unlockHint:
      "Get ×1 mystery cup from the machine to unlock this episode.",
  },
  {
    id: "ep-3",
    ep: 3,
    title: "Time for a new machine",
    body: "Too many weird things in those cups. This filthy box can’t be trusted. Time to swap it for another machine — fingers crossed the nightmare finally ends.",
    unlockIcons: [
      "/assets/story/req-good-coffee.svg",
      "/assets/story/req-question.svg",
    ],
    unlockCount: 100,
    unlockHint:
      "Get ×100 mystery cups from the machine to unlock this episode.",
  },
  {
    id: "ep-4",
    ep: 4,
    title: "Something moved in the foam",
    body: "Clean machine. Pretty cup. For one sip you’re safe — then the surface twitches. Legs? Wings? You don’t look long enough to decide. Whatever sold you this unit is lying, or worse: they know. Keep pouring. Build the evidence. Something is breeding in there, and you’re going to catch it in the act.",
    unlockIcons: [
      "/assets/story/req-good-coffee.svg",
      "/assets/story/req-question.svg",
    ],
    unlockCount: 1,
    unlockHint:
      "Get ×1 mystery cup from the machine to unlock this episode.",
  },
  {
    id: "ep-5",
    ep: 5,
    title: "Same logo, colder light",
    body: "A hundred cursed cups later, you call the brand. They don’t apologize — they upgrade you. Same logo, cyan glow, lawyer-smooth and wrong. If bugs crawl out of this one too, it was never the pipes.",
    unlockIcons: [
      "/assets/story/req-good-coffee.svg",
      "/assets/story/req-question.svg",
    ],
    unlockCount: 100,
    unlockHint:
      "Get ×100 mystery cups from the machine to unlock this episode.",
  },
  {
    id: "ep-6",
    ep: 6,
    title: "Not a bug. A file.",
    body: "You expect legs. Instead the neon cup spills a microSD card. Relief — then dread. Why is storage in your drink? Wipe it clean. You need to know what’s on this thing. Keep pouring — this machine is still hiding more, and it surely packs “bugs” like this one.",
    unlockIcons: [
      "/assets/story/req-good-coffee.svg",
      "/assets/story/req-question.svg",
    ],
    unlockCount: 1,
    unlockHint:
      "Get ×1 mystery cup from the machine to unlock this episode.",
  },
  {
    id: "ep-7",
    ep: 7,
    title: "Locked",
    body: "",
    unlockHint: "Keep pouring. This chapter isn’t ready yet.",
  },
  {
    id: "ep-8",
    ep: 8,
    title: "Locked",
    body: "",
    unlockHint: "Keep pouring. This chapter isn’t ready yet.",
  },
  {
    id: "ep-9",
    ep: 9,
    title: "Locked",
    body: "",
    unlockHint: "Keep pouring. This chapter isn’t ready yet.",
  },
  {
    id: "ep-10",
    ep: 10,
    title: "Locked",
    body: "",
    unlockHint: "Keep pouring. This chapter isn’t ready yet.",
  },
];

export function useCoffeeStory({ unlockedEpisodeIds }: CoffeeStoryProps) {
  const [lockedFocus, setLockedFocus] = useState<StoryEpisodeView | null>(null);
  const unlocked = new Set(unlockedEpisodeIds);
  const episodes: StoryEpisodeView[] = STORY_EPISODES.map((episode) => ({
    ...episode,
    unlocked: unlocked.has(episode.id),
  }));

  function openLocked(episode: StoryEpisodeView) {
    if (episode.unlocked) return;
    setLockedFocus(episode);
  }

  function closeLocked() {
    setLockedFocus(null);
  }

  return { episodes, lockedFocus, openLocked, closeLocked };
}
