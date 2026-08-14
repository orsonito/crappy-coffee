"use client";

import { useState } from "react";
import {
  COFFEE_CATALOG,
  CoffeeStatsProps,
  CollectionSlot,
  GRID_SIZE,
  LOCKED_ICON,
} from "./coffeestats.types";

export function useCoffeeStats({ counts }: CoffeeStatsProps) {
  const [selected, setSelected] = useState<CollectionSlot | null>(null);

  const slots: CollectionSlot[] = Array.from({ length: GRID_SIZE }, (_, i) => {
    const entry = COFFEE_CATALOG[i];
    if (entry) {
      const count = counts[entry.id];
      const unlocked = count > 0;
      return {
        id: entry.id,
        label: entry.label,
        description: entry.description,
        count,
        unlocked,
        icon: unlocked ? entry.icon : LOCKED_ICON,
        hintIcons: entry.hintIcons,
      };
    }
    return {
      id: `locked-${i}`,
      label: "Locked",
      description: "",
      count: 0,
      unlocked: false,
      icon: LOCKED_ICON,
    };
  });

  function openSlot(slot: CollectionSlot) {
    if (!slot.unlocked) return;
    setSelected(slot);
  }

  function closeDetail() {
    setSelected(null);
  }

  return { slots, selected, openSlot, closeDetail };
}
