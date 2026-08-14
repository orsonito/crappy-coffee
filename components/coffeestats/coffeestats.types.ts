export type CoffeeId =
  | "good-coffee"
  | "good-coffee-modern"
  | "good-coffee-future"
  | "crapuccino"
  | "crapuccino-fly"
  | "crapuccino-worm"
  | "crapuccino-spider"
  | "crapuccino-duo"
  | "crapuccino-flies"
  | "crapuccino-worm-eggs"
  | "crapuccino-webs"
  | "crapuccino-microsd";

export type CoffeeKind = "good" | "crappy";

export type CoffeeDef = {
  id: CoffeeId;
  label: string;
  description: string;
  icon: string;
  kind: CoffeeKind;
  /** Small ink SVG hints shown on locked collection cells. */
  hintIcons?: string[];
  /** Only pours after the clean machine (EP 3) is unlocked. */
  requiresCleanMachine?: boolean;
  /** Only pours after the futuristic machine (EP 5) is unlocked. */
  requiresFutureMachine?: boolean;
};

export const LOCKED_ICON = "/assets/collection/locked.png";
export const GRID_SIZE = 16;

export const COFFEE_CATALOG: CoffeeDef[] = [
  {
    id: "good-coffee",
    label: "Good coffee",
    description:
      "A surprisingly decent cup from a broken machine. Hot, bitter, and somehow drinkable.",
    icon: "/assets/collection/good-coffee.png",
    kind: "good",
    hintIcons: ["/assets/story/req-good-coffee.svg"],
  },
  {
    id: "good-coffee-modern",
    label: "Good coffee",
    description:
      "Same bitter comfort, new striped cup. The clean machine almost makes you believe the nightmare is over.",
    icon: "/assets/collection/good-coffee-modern.png",
    kind: "good",
    requiresCleanMachine: true,
    hintIcons: ["/assets/story/req-good-coffee.svg"],
  },
  {
    id: "good-coffee-future",
    label: "Good coffee",
    description:
      "Neon blue, glowing, suspiciously perfect. The cup looks engineered to make you trust the brand again.",
    icon: "/assets/collection/good-coffee-future.png",
    kind: "good",
    requiresFutureMachine: true,
    hintIcons: ["/assets/story/req-good-coffee.svg"],
  },
  {
    id: "crapuccino",
    label: "Crapuccino",
    description:
      "The classic: lukewarm sludge with a cockroach guest. House specialty.",
    icon: "/assets/crappy-cups/pixel-art.png",
    kind: "crappy",
    hintIcons: [
      "/assets/story/req-good-coffee.svg",
      "/assets/story/req-question.svg",
    ],
  },
  {
    id: "crapuccino-fly",
    label: "Crapuccino",
    description:
      "Same sludge, different roommate. A fly found the foam and never left.",
    icon: "/assets/collection/crapuccino-fly.png",
    kind: "crappy",
    hintIcons: [
      "/assets/story/req-good-coffee.svg",
      "/assets/story/req-question.svg",
    ],
  },
  {
    id: "crapuccino-worm",
    label: "Crapuccino",
    description:
      "Something wriggled up from the bottom. You hope it’s just the milk.",
    icon: "/assets/collection/crapuccino-worm.png",
    kind: "crappy",
    hintIcons: [
      "/assets/story/req-good-coffee.svg",
      "/assets/story/req-question.svg",
    ],
  },
  {
    id: "crapuccino-spider",
    label: "Crapuccino",
    description:
      "Eight legs on the rim. The machine denies all knowledge.",
    icon: "/assets/collection/crapuccino-spider.png",
    kind: "crappy",
    hintIcons: [
      "/assets/story/req-good-coffee.svg",
      "/assets/story/req-question.svg",
    ],
  },
  {
    id: "crapuccino-duo",
    label: "Crapuccino",
    description:
      "New machine, new cup, same curse — two enormous cockroaches riding the rim like they paid for a double.",
    icon: "/assets/collection/crapuccino-duo.png",
    kind: "crappy",
    requiresCleanMachine: true,
    hintIcons: [
      "/assets/story/req-good-coffee.svg",
      "/assets/story/req-question.svg",
    ],
  },
  {
    id: "crapuccino-flies",
    label: "Crapuccino",
    description:
      "A whole swarm decided your cup was an airport. Wings everywhere — the foam never stood a chance.",
    icon: "/assets/collection/crapuccino-flies.png",
    kind: "crappy",
    requiresCleanMachine: true,
    hintIcons: [
      "/assets/story/req-good-coffee.svg",
      "/assets/story/req-question.svg",
    ],
  },
  {
    id: "crapuccino-worm-eggs",
    label: "Crapuccino",
    description:
      "The worms didn’t just visit — they nested. Pale eggs cling to the rim like a second foam.",
    icon: "/assets/collection/crapuccino-worm-eggs.png",
    kind: "crappy",
    requiresCleanMachine: true,
    hintIcons: [
      "/assets/story/req-good-coffee.svg",
      "/assets/story/req-question.svg",
    ],
  },
  {
    id: "crapuccino-webs",
    label: "Crapuccino",
    description:
      "Cobwebs stitch the rim shut and spiders commute across the foam. Your cup is a haunted corner now.",
    icon: "/assets/collection/crapuccino-webs.png",
    kind: "crappy",
    requiresCleanMachine: true,
    hintIcons: [
      "/assets/story/req-good-coffee.svg",
      "/assets/story/req-question.svg",
    ],
  },
  {
    id: "crapuccino-microsd",
    label: "Crapuccino",
    description:
      "The neon cup tipped. No bug this time — a microSD card winks up from the spill like it wanted to be found.",
    icon: "/assets/collection/crapuccino-microsd.png",
    kind: "crappy",
    requiresFutureMachine: true,
    hintIcons: [
      "/assets/story/req-good-coffee.svg",
      "/assets/story/req-question.svg",
    ],
  },
];

export const CRAPPY_COFFEES = COFFEE_CATALOG.filter((c) => c.kind === "crappy");

export const LEGACY_CRAPPY_COFFEES = CRAPPY_COFFEES.filter(
  (c) => !c.requiresCleanMachine && !c.requiresFutureMachine
);

export const MODERN_CRAPPY_COFFEES = CRAPPY_COFFEES.filter(
  (c) => c.requiresCleanMachine && !c.requiresFutureMachine
);

export const FUTURE_CRAPPY_COFFEES = CRAPPY_COFFEES.filter(
  (c) => c.requiresFutureMachine
);

export function getCoffee(id: CoffeeId): CoffeeDef {
  const found = COFFEE_CATALOG.find((c) => c.id === id);
  if (!found) throw new Error(`Unknown coffee: ${id}`);
  return found;
}

export type CoffeeCounts = Record<CoffeeId, number>;

export const EMPTY_COUNTS: CoffeeCounts = {
  "good-coffee": 0,
  "good-coffee-modern": 0,
  "good-coffee-future": 0,
  crapuccino: 0,
  "crapuccino-fly": 0,
  "crapuccino-worm": 0,
  "crapuccino-spider": 0,
  "crapuccino-duo": 0,
  "crapuccino-flies": 0,
  "crapuccino-worm-eggs": 0,
  "crapuccino-webs": 0,
  "crapuccino-microsd": 0,
};

export type CoffeeStatsProps = {
  counts: CoffeeCounts;
  onNavigateToMachine?: () => void;
};

export type CollectionSlot = {
  id: string;
  label: string;
  description: string;
  count: number;
  unlocked: boolean;
  icon: string;
  hintIcons?: string[];
};
