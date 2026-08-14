export type StoryEpisode = {
  id: string;
  ep: number;
  title: string;
  body: string;
  /** Small icons — what unlocks this episode. */
  unlockIcons?: string[];
  /** How many needed (shown as ×N). Default 1 when icons exist. */
  unlockCount?: number;
  /** If true, any one of the icons counts (show “/” between them). */
  unlockAny?: boolean;
  /** Short copy for the locked-episode modal. */
  unlockHint?: string;
};

export type StoryEpisodeView = StoryEpisode & {
  unlocked: boolean;
};

export type CoffeeStoryProps = {
  unlockedEpisodeIds: string[];
  onNavigateToMachine?: () => void;
};
