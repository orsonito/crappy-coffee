export type CoffeeVerdict = "good" | "crappy" | null;

export type MachineStyle = "pixel-art" | "pixel-art-clean" | "pixel-art-future";

export const MACHINE_STYLE: MachineStyle = "pixel-art";
export const MACHINE_STYLE_CLEAN: MachineStyle = "pixel-art-clean";
export const MACHINE_STYLE_FUTURE: MachineStyle = "pixel-art-future";

export type VendingMachineProps = Record<string, never>;

export const POUR_MULTIPLIERS = [5, 10, 20, 50, 100] as const;

export type PourMultiplier = (typeof POUR_MULTIPLIERS)[number];

export const MULTIPLIER_COOLDOWN_MS = 3000;

export function getUnlockedMultipliers(
  unlockedEpisodeIds: string[]
): readonly PourMultiplier[] {
  if (!unlockedEpisodeIds.includes("ep-5")) return [];
  if (unlockedEpisodeIds.includes("ep-6")) return [5, 10];
  return [5];
}

export type FloatCoffee = {
  key: number;
  id: string;
  icon: string;
  label: string;
  count: number;
  amount: number;
  drift: number;
};
