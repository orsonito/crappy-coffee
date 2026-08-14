"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  CoffeeId,
  CRAPPY_COFFEES,
  EMPTY_COUNTS,
  getCoffee,
  CoffeeCounts,
  LEGACY_CRAPPY_COFFEES,
  MODERN_CRAPPY_COFFEES,
} from "@/components/coffeestats/coffeestats.types";
import { STORY_EPISODES } from "@/components/coffeestory/coffeestory.hooks";
import { StoryEpisode } from "@/components/coffeestory/coffeestory.types";
import {
  FloatCoffee,
  MACHINE_STYLE,
  MACHINE_STYLE_CLEAN,
  MACHINE_STYLE_FUTURE,
  MULTIPLIER_COOLDOWN_MS,
  getUnlockedMultipliers,
} from "./vendingmachine.types";
import { loadGameSave, saveGameSave } from "./vendingmachine.storage";

const FLOAT_MS = 2000;
const BANNER_HOLD_MS = 1100;
const BANNER_EXIT_MS = 380;
const INITIAL_EPISODES = ["ep-0"];

type BannerVariant = "good" | "crappy";
type CoffeeStain = {
  id: number;
  x: number;
  y: number;
  size: number;
  rot: number;
  delay: number;
  variant: 0 | 1 | 2 | 3;
  opacity: number;
};
type BannerState = {
  key: number;
  phase: "in" | "shown" | "out";
  variant: BannerVariant;
};
type StainBurstState = {
  key: number;
  stains: CoffeeStain[];
  phase: "in" | "shown" | "out";
  enter: boolean;
};

function makeCoffeeStains(): CoffeeStain[] {
  const count = 7 + Math.floor(Math.random() * 3);
  return Array.from({ length: count }, (_, id) => ({
    id,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 8 + Math.random() * 16,
    rot: Math.random() * 360,
    delay: Math.random() * 0.28,
    variant: (id % 4) as 0 | 1 | 2 | 3,
    opacity: 0.42 + Math.random() * 0.28,
  }));
}

function pickFrom<T extends { id: CoffeeId }>(list: T[]): CoffeeId {
  return list[Math.floor(Math.random() * list.length)].id;
}

function vibrateUnlock() {
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    navigator.vibrate([45, 70, 45, 70, 120]);
  }
}

export function useVendingMachine() {
  const [coffeeUnlockOpen, setCoffeeUnlockOpen] = useState(false);
  const [unlockedCoffeeId, setUnlockedCoffeeId] =
    useState<CoffeeId>("good-coffee");
  const [storyUnlockOpen, setStoryUnlockOpen] = useState(false);
  const [pendingStoryEpisode, setPendingStoryEpisode] =
    useState<StoryEpisode | null>(null);
  const [unlockedEpisodeIds, setUnlockedEpisodeIds] =
    useState<string[]>(INITIAL_EPISODES);
  const [counts, setCounts] = useState<CoffeeCounts>(EMPTY_COUNTS);
  const [isPressing, setIsPressing] = useState(false);
  const [pressingMultiplier, setPressingMultiplier] = useState<number | null>(
    null
  );
  const [floats, setFloats] = useState<FloatCoffee[]>([]);
  const [banner, setBanner] = useState<BannerState | null>(null);
  const [stainBurst, setStainBurst] = useState<StainBurstState | null>(null);
  const [hasPouredOnce, setHasPouredOnce] = useState(false);
  const [saveReady, setSaveReady] = useState(false);
  const [coolingByMultiplier, setCoolingByMultiplier] = useState<
    Record<number, boolean>
  >({});
  const [cooldownTokens, setCooldownTokens] = useState<Record<number, number>>(
    {}
  );
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cooldownTimers = useRef<
    Map<number, ReturnType<typeof setTimeout>>
  >(new Map());
  const floatKey = useRef(0);
  const bannerKey = useRef(0);
  const stainKey = useRef(0);
  const bannerHoldTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bannerExitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stainExitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useLayoutEffect(() => {
    const saved = loadGameSave();
    if (saved) {
      setCounts(saved.counts);
      setUnlockedEpisodeIds(saved.unlockedEpisodeIds);
      setHasPouredOnce(saved.hasPouredOnce);
    }
    setSaveReady(true);
  }, []);

  useEffect(() => {
    if (!saveReady) return;
    saveGameSave({
      counts,
      unlockedEpisodeIds,
      hasPouredOnce,
    });
  }, [counts, unlockedEpisodeIds, hasPouredOnce, saveReady]);

  const cleanMachine = unlockedEpisodeIds.includes("ep-3");
  const futureMachine = unlockedEpisodeIds.includes("ep-5");
  const style = futureMachine
    ? MACHINE_STYLE_FUTURE
    : cleanMachine
      ? MACHINE_STYLE_CLEAN
      : MACHINE_STYLE;
  const unlockedMultipliers = getUnlockedMultipliers(unlockedEpisodeIds);

  useEffect(() => {
    const timers = cooldownTimers.current;
    return () => {
      for (const timer of timers.values()) clearTimeout(timer);
      timers.clear();
      if (bannerHoldTimer.current) clearTimeout(bannerHoldTimer.current);
      if (bannerExitTimer.current) clearTimeout(bannerExitTimer.current);
      if (stainExitTimer.current) clearTimeout(stainExitTimer.current);
    };
  }, []);

  function clearBannerTimers() {
    if (bannerHoldTimer.current) {
      clearTimeout(bannerHoldTimer.current);
      bannerHoldTimer.current = null;
    }
    if (bannerExitTimer.current) {
      clearTimeout(bannerExitTimer.current);
      bannerExitTimer.current = null;
    }
  }

  function clearStainExitTimer() {
    if (stainExitTimer.current) {
      clearTimeout(stainExitTimer.current);
      stainExitTimer.current = null;
    }
  }

  function fadeOutStains() {
    setStainBurst((prev) =>
      prev && prev.phase !== "out" ? { ...prev, phase: "out", enter: false } : prev
    );
    clearStainExitTimer();
    stainExitTimer.current = setTimeout(() => {
      setStainBurst(null);
      stainExitTimer.current = null;
    }, BANNER_EXIT_MS);
  }

  function spawnStains() {
    clearStainExitTimer();
    setStainBurst((prev) => {
      if (!prev) {
        return {
          key: ++stainKey.current,
          stains: makeCoffeeStains(),
          phase: "in",
          enter: true,
        };
      }
      if (prev.phase === "out") {
        return { ...prev, phase: "shown", enter: false };
      }
      return prev;
    });
  }

  function scheduleBannerDismiss() {
    clearBannerTimers();
    bannerHoldTimer.current = setTimeout(() => {
      setBanner((prev) => (prev ? { ...prev, phase: "out" } : null));
      fadeOutStains();
      bannerExitTimer.current = setTimeout(() => {
        setBanner(null);
        bannerExitTimer.current = null;
      }, BANNER_EXIT_MS);
      bannerHoldTimer.current = null;
    }, BANNER_HOLD_MS);
  }

  function spawnBanner(variant: BannerVariant) {
    setBanner((prev) => {
      if (!prev || prev.variant !== variant) {
        return { key: ++bannerKey.current, phase: "in", variant };
      }
      // Same kind still pouring — keep visible, no re-entrance.
      if (prev.phase === "out") {
        return { ...prev, phase: "shown" };
      }
      return prev;
    });
    if (variant === "crappy") {
      spawnStains();
    } else {
      fadeOutStains();
    }
    scheduleBannerDismiss();
  }

  function onBannerEnterEnd() {
    setBanner((prev) =>
      prev && prev.phase === "in" ? { ...prev, phase: "shown" } : prev
    );
  }

  function spawnFloat(id: CoffeeId, nextCount: number, amount: number) {
    const coffee = getCoffee(id);
    const key = ++floatKey.current;
    const drift = (Math.random() * 2 - 1) * 42;
    setFloats((prev) => [
      ...prev,
      {
        key,
        id,
        icon: coffee.icon,
        label: coffee.label,
        count: nextCount,
        amount,
        drift,
      },
    ]);
    setTimeout(() => {
      setFloats((prev) => prev.filter((f) => f.key !== key));
    }, FLOAT_MS);
  }

  function unlockEpisode(episodeId: string): StoryEpisode | null {
    if (unlockedEpisodeIds.includes(episodeId)) return null;
    const episode = STORY_EPISODES.find((e) => e.id === episodeId);
    if (!episode) return null;
    setUnlockedEpisodeIds((prev) => [...prev, episodeId]);
    setPendingStoryEpisode(episode);
    return episode;
  }

  function dispense(amount = 1) {
    if (!saveReady) return;
    if (pressTimer.current) clearTimeout(pressTimer.current);
    if (amount === 1) {
      setIsPressing(true);
      setPressingMultiplier(null);
    } else {
      setPressingMultiplier(amount);
      setIsPressing(false);
    }
    pressTimer.current = setTimeout(() => {
      setIsPressing(false);
      setPressingMultiplier(null);
    }, 220);

    const isFirstPour = !hasPouredOnce;
    setHasPouredOnce(true);

    const isFirstCleanPour =
      cleanMachine && !futureMachine && counts["good-coffee-modern"] === 0;

    let id: CoffeeId;
    let kind: "good" | "crappy";
    if (isFirstPour) {
      id = "good-coffee";
      kind = "good";
    } else if (futureMachine) {
      const futureGoods = counts["good-coffee-future"];
      const microsdOwned = counts["crapuccino-microsd"] > 0;
      const microsdPoolReady = futureGoods >= 100 && !microsdOwned;
      if (!microsdPoolReady) {
        id = "good-coffee-future";
        kind = "good";
      } else if (Math.random() < 0.5) {
        id = "good-coffee-future";
        kind = "good";
      } else {
        id = "crapuccino-microsd";
        kind = "crappy";
      }
    } else if (isFirstCleanPour) {
      id = "good-coffee-modern";
      kind = "good";
    } else {
      kind = Math.random() < 0.5 ? "good" : "crappy";
      if (kind === "good") {
        id = cleanMachine ? "good-coffee-modern" : "good-coffee";
      } else {
        id = cleanMachine
          ? pickFrom(MODERN_CRAPPY_COFFEES)
          : pickFrom(LEGACY_CRAPPY_COFFEES);
      }
    }

    const isNewCoffeeUnlock = counts[id] === 0;
    // Unique drop: microSD can only ever be obtained once.
    const pourAmount = id === "crapuccino-microsd" ? 1 : amount;
    const nextCount = counts[id] + pourAmount;
    setCounts((prev) => ({ ...prev, [id]: nextCount }));

    spawnBanner(kind === "good" ? "good" : "crappy");

    let unlockedStory: StoryEpisode | null = null;

    if (id === "good-coffee" && isNewCoffeeUnlock) {
      unlockedStory = unlockEpisode("ep-1") ?? unlockedStory;
    }

    if (kind === "crappy") {
      const prevCrappyTotal = CRAPPY_COFFEES.reduce(
        (sum, c) => sum + counts[c.id],
        0
      );
      const nextCrappyTotal = prevCrappyTotal + pourAmount;
      if (prevCrappyTotal === 0) {
        unlockedStory = unlockEpisode("ep-2") ?? unlockedStory;
      }
      if (nextCrappyTotal >= 100) {
        unlockedStory = unlockEpisode("ep-3") ?? unlockedStory;
      }

      const prevModernCrappy = MODERN_CRAPPY_COFFEES.reduce(
        (sum, c) => sum + counts[c.id],
        0
      );
      const nextModernCrappy = prevModernCrappy + pourAmount;
      if (cleanMachine && prevModernCrappy === 0) {
        unlockedStory = unlockEpisode("ep-4") ?? unlockedStory;
      }
      if (cleanMachine && nextModernCrappy >= 100) {
        unlockedStory = unlockEpisode("ep-5") ?? unlockedStory;
      }
    }

    if (id === "crapuccino-microsd" && isNewCoffeeUnlock) {
      unlockedStory = unlockEpisode("ep-6") ?? unlockedStory;
    }

    if (isNewCoffeeUnlock) {
      setUnlockedCoffeeId(id);
      setCoffeeUnlockOpen(true);
      if (kind === "crappy") vibrateUnlock();
    } else {
      spawnFloat(id, nextCount, pourAmount);
      if (unlockedStory) {
        setStoryUnlockOpen(true);
      }
    }
  }

  function closeCoffeeUnlockModal() {
    setCoffeeUnlockOpen(false);
    if (pendingStoryEpisode) {
      setStoryUnlockOpen(true);
    }
  }

  function closeStoryUnlockModal() {
    setStoryUnlockOpen(false);
    setPendingStoryEpisode(null);
  }

  function dispenseMultiplier(amount: number) {
    if (coolingByMultiplier[amount]) return;
    if (!(unlockedMultipliers as readonly number[]).includes(amount)) return;
    dispense(amount);
    setCoolingByMultiplier((prev) => ({ ...prev, [amount]: true }));
    setCooldownTokens((prev) => ({
      ...prev,
      [amount]: (prev[amount] ?? 0) + 1,
    }));
    const existing = cooldownTimers.current.get(amount);
    if (existing) clearTimeout(existing);
    const timer = setTimeout(() => {
      setCoolingByMultiplier((prev) => ({ ...prev, [amount]: false }));
      cooldownTimers.current.delete(amount);
    }, MULTIPLIER_COOLDOWN_MS);
    cooldownTimers.current.set(amount, timer);
  }

  const unlockedCoffee = getCoffee(unlockedCoffeeId);

  return {
    style,
    coffeeUnlockOpen,
    unlockedCoffee,
    storyUnlockOpen,
    pendingStoryEpisode,
    unlockedEpisodeIds,
    counts,
    isPressing,
    pressingMultiplier,
    floats,
    banner,
    stainBurst,
    unlockedMultipliers,
    coolingByMultiplier,
    cooldownTokens,
    dispense,
    dispenseMultiplier,
    closeCoffeeUnlockModal,
    closeStoryUnlockModal,
    onBannerEnterEnd,
  };
}
