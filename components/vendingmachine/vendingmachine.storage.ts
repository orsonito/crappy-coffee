import {
  CoffeeCounts,
  CoffeeId,
  EMPTY_COUNTS,
} from "@/components/coffeestats/coffeestats.types";

const STORAGE_KEY = "crappuccino-save-v1";

export type GameSave = {
  v: 1;
  counts: CoffeeCounts;
  unlockedEpisodeIds: string[];
  hasPouredOnce: boolean;
};

const VALID_EPISODE_IDS = new Set([
  "ep-0",
  "ep-1",
  "ep-2",
  "ep-3",
  "ep-4",
  "ep-5",
  "ep-6",
  "ep-7",
  "ep-8",
  "ep-9",
  "ep-10",
]);

function normalizeCounts(raw: unknown): CoffeeCounts {
  const counts = { ...EMPTY_COUNTS };
  if (!raw || typeof raw !== "object") return counts;
  const record = raw as Record<string, unknown>;
  for (const id of Object.keys(EMPTY_COUNTS) as CoffeeId[]) {
    const value = record[id];
    if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
      counts[id] = Math.floor(value);
    }
  }
  return counts;
}

function normalizeEpisodes(raw: unknown): string[] {
  if (!Array.isArray(raw)) return ["ep-0"];
  const ids = raw.filter(
    (id): id is string => typeof id === "string" && VALID_EPISODE_IDS.has(id)
  );
  if (!ids.includes("ep-0")) ids.unshift("ep-0");
  return [...new Set(ids)];
}

export function loadGameSave(): GameSave | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<GameSave>;
    return {
      v: 1,
      counts: normalizeCounts(parsed.counts),
      unlockedEpisodeIds: normalizeEpisodes(parsed.unlockedEpisodeIds),
      hasPouredOnce: Boolean(parsed.hasPouredOnce),
    };
  } catch {
    return null;
  }
}

export function saveGameSave(save: Omit<GameSave, "v">): void {
  if (typeof window === "undefined") return;
  try {
    const payload: GameSave = {
      v: 1,
      counts: normalizeCounts(save.counts),
      unlockedEpisodeIds: normalizeEpisodes(save.unlockedEpisodeIds),
      hasPouredOnce: Boolean(save.hasPouredOnce),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Quota / private mode — ignore; game still works in-session.
  }
}
