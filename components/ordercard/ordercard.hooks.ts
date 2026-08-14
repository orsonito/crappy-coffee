"use client";

import { useState } from "react";

export function useOrderCard() {
  const [selected, setSelected] = useState(false);
  return { selected, setSelected };
}
