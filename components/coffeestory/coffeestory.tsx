"use client";

import React from "react";
import "./coffeestory.css";
import { CoffeeStoryProps } from "./coffeestory.types";
import { useCoffeeStory } from "./coffeestory.hooks";

function LockIcon() {
  return (
    <svg
      className="coffeestory__lock"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M17 9h-1V7a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2zm-7-2a2 2 0 1 1 4 0v2h-4V7zm4 8.5a1.5 1.5 0 1 1-3 0v-1a1.5 1.5 0 1 1 3 0v1z"
      />
    </svg>
  );
}

function UnlockReqs({
  icons,
  unlockAny,
  unlockCount,
  size = "sm",
}: {
  icons: string[];
  unlockAny?: boolean;
  unlockCount?: number;
  size?: "sm" | "lg";
}) {
  return (
    <div
      className={`coffeestory__reqs${size === "lg" ? " coffeestory__reqs--lg" : ""}`}
    >
      {icons.map((icon, index) => (
        <React.Fragment key={icon}>
          {unlockAny && index > 0 ? (
            <span className="coffeestory__req-or">/</span>
          ) : null}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={icon}
            alt=""
            width={size === "lg" ? 96 : 40}
            height={size === "lg" ? 96 : 40}
            className={`coffeestory__req-icon${
              icon.includes("question") ? " coffeestory__req-icon--q" : ""
            }`}
            draggable={false}
          />
        </React.Fragment>
      ))}
      <span className="coffeestory__req-count">×{unlockCount ?? 1}</span>
    </div>
  );
}

const CoffeeStory = ({
  unlockedEpisodeIds,
  onNavigateToMachine,
}: CoffeeStoryProps) => {
  const { episodes, lockedFocus, openLocked, closeLocked } = useCoffeeStory({
    unlockedEpisodeIds,
  });

  return (
    <div className="coffeestory">
      <button
        type="button"
        className="coffeestory__nav-arrow coffeestory__nav-arrow--right"
        onClick={onNavigateToMachine}
        aria-label="Go to machine"
      >
        ›
      </button>

      <div className="coffeestory__body">
        <h2 className="coffeestory__title">HISTORY</h2>

        <ul className="coffeestory__list">
          {episodes.map((episode) => (
            <li key={episode.id} className="coffeestory__card-item">
              {episode.unlocked ? (
                <div className="coffeestory__card">
                  <div className="coffeestory__ep-row">
                    <p className="coffeestory__ep">EP {episode.ep}</p>
                    {episode.unlockIcons?.length ? (
                      <UnlockReqs
                        icons={episode.unlockIcons}
                        unlockAny={episode.unlockAny}
                        unlockCount={episode.unlockCount}
                      />
                    ) : null}
                  </div>
                  <h3 className="coffeestory__card-title">{episode.title}</h3>
                  <p className="coffeestory__body-text">{episode.body}</p>
                </div>
              ) : (
                <button
                  type="button"
                  className="coffeestory__card coffeestory__card--locked"
                  onClick={() => openLocked(episode)}
                  aria-label={`EP ${episode.ep} locked. See unlock requirements.`}
                >
                  <div className="coffeestory__ep-row">
                    <p className="coffeestory__ep">
                      <LockIcon />
                      EP {episode.ep}
                    </p>
                    {episode.unlockIcons?.length ? (
                      <UnlockReqs
                        icons={episode.unlockIcons}
                        unlockAny={episode.unlockAny}
                        unlockCount={episode.unlockCount}
                      />
                    ) : null}
                  </div>
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {lockedFocus ? (
        <div
          className="coffeestory__modal"
          role="dialog"
          aria-modal="true"
          aria-label={`How to unlock EP ${lockedFocus.ep}`}
          onClick={closeLocked}
        >
          <div className="coffeestory__modal-body">
            <p className="coffeestory__modal-kicker">Locked</p>
            <p className="coffeestory__modal-title">EP {lockedFocus.ep}</p>
            {lockedFocus.unlockIcons?.length ? (
              <UnlockReqs
                icons={lockedFocus.unlockIcons}
                unlockAny={lockedFocus.unlockAny}
                unlockCount={lockedFocus.unlockCount}
                size="lg"
              />
            ) : null}
            <p className="coffeestory__modal-desc">
              {lockedFocus.unlockHint ??
                "Keep pouring. This chapter isn’t ready yet."}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default CoffeeStory;
