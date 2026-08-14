"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import "./vendingmachine.css";
import { useVendingMachine } from "./vendingmachine.hooks";
import CoffeeStats from "@/components/coffeestats/coffeestats";
import CoffeeStory from "@/components/coffeestory/coffeestory";
import { MULTIPLIER_COOLDOWN_MS } from "./vendingmachine.types";

const POUR_IDLE_MS = 5000;

const VendingMachine = () => {
  const {
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
  } = useVendingMachine();
  const pagerRef = useRef<HTMLDivElement>(null);
  const [pourNudge, setPourNudge] = useState(false);
  const totalCoffees = Object.values(counts).reduce((sum, n) => sum + n, 0);

  useEffect(() => {
    const pager = pagerRef.current;
    if (!pager) return;

    const mobileQuery = window.matchMedia("(max-width: 63.99rem)");
    const centerOnMachine = () => {
      if (!mobileQuery.matches) {
        pager.scrollLeft = 0;
        return;
      }
      pager.scrollLeft = pager.clientWidth;
    };

    centerOnMachine();
    const id = requestAnimationFrame(centerOnMachine);
    mobileQuery.addEventListener("change", centerOnMachine);
    window.addEventListener("resize", centerOnMachine);

    return () => {
      cancelAnimationFrame(id);
      mobileQuery.removeEventListener("change", centerOnMachine);
      window.removeEventListener("resize", centerOnMachine);
    };
  }, []);

  useEffect(() => {
    if (coffeeUnlockOpen || storyUnlockOpen) {
      setPourNudge(false);
      return;
    }
    setPourNudge(false);
    const timer = setTimeout(() => setPourNudge(true), POUR_IDLE_MS);
    return () => clearTimeout(timer);
  }, [coffeeUnlockOpen, storyUnlockOpen, counts]);

  function scrollPager(direction: -1 | 1) {
    const pager = pagerRef.current;
    if (!pager) return;
    if (!window.matchMedia("(max-width: 63.99rem)").matches) return;
    pager.scrollBy({
      left: direction * pager.clientWidth,
      behavior: "smooth",
    });
  }

  return (
    <div className="vendingmachine-pager" ref={pagerRef}>
      <section
        className="vendingmachine-pager__page vendingmachine-pager__page--story"
        aria-label="Story"
      >
        <CoffeeStory
          unlockedEpisodeIds={unlockedEpisodeIds}
          onNavigateToMachine={() => scrollPager(1)}
        />
      </section>

      <section
        className="vendingmachine-pager__page vendingmachine"
        aria-label="Machine"
      >
        {stainBurst ? (
          <div
            key={`stains-${stainBurst.key}`}
            className={`vendingmachine__stains${stainBurst.enter && stainBurst.phase !== "out" ? " vendingmachine__stains--in" : ""}${stainBurst.phase === "out" ? " vendingmachine__stains--out" : ""}`}
            aria-hidden
          >
            {stainBurst.stains.map((stain) => (
              <span
                key={stain.id}
                className={`vendingmachine__stain vendingmachine__stain--${stain.variant}`}
                style={{
                  left: `${stain.x}%`,
                  top: `${stain.y}%`,
                  ["--stain-size" as string]: `${stain.size}vmin`,
                  ["--stain-rot" as string]: `${stain.rot}deg`,
                  ["--stain-delay" as string]: `${stain.delay}s`,
                  ["--stain-opacity" as string]: String(stain.opacity),
                }}
              />
            ))}
          </div>
        ) : null}

        {banner ? (
          <div
            key={banner.key}
            className={[
              "vendingmachine__banner",
              banner.variant === "crappy"
                ? "vendingmachine__banner--crappy"
                : "vendingmachine__banner--good",
              banner.phase === "out" ? "vendingmachine__banner--out" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-hidden
          >
            {banner.variant === "crappy" ? (
              <p
                className={`vendingmachine__banner-line vendingmachine__banner-line--single${banner.phase === "in" ? " vendingmachine__banner-line--in" : ""}`}
                onAnimationEnd={
                  banner.phase === "in" ? onBannerEnterEnd : undefined
                }
              >
                CRAPUCCINO
              </p>
            ) : (
              <>
                <p
                  className={`vendingmachine__banner-line vendingmachine__banner-line--top${banner.phase === "in" ? " vendingmachine__banner-line--in" : ""}`}
                  onAnimationEnd={
                    banner.phase === "in" ? onBannerEnterEnd : undefined
                  }
                >
                  GOOD
                </p>
                <p
                  className={`vendingmachine__banner-line vendingmachine__banner-line--bottom${banner.phase === "in" ? " vendingmachine__banner-line--in" : ""}`}
                >
                  COFFEE
                </p>
              </>
            )}
          </div>
        ) : null}

        <p className="vendingmachine__total" aria-label={`Total coffees ${totalCoffees}`}>
          <span className="vendingmachine__total-value">{totalCoffees}</span>
          <Image
            src="/assets/story/req-good-coffee.svg"
            alt=""
            width={36}
            height={36}
            className="vendingmachine__total-icon"
            draggable={false}
          />
        </p>

        <button
          type="button"
          className="vendingmachine__nav-arrow vendingmachine__nav-arrow--left"
          onClick={() => scrollPager(-1)}
          aria-label="Go to story"
        >
          ‹
        </button>
        <button
          type="button"
          className="vendingmachine__nav-arrow vendingmachine__nav-arrow--right"
          onClick={() => scrollPager(1)}
          aria-label="Go to collection"
        >
          ›
        </button>

        <div className="vendingmachine__stage">
          <div className="vendingmachine__floats" aria-hidden>
            {floats.map((f) => (
              <div
                key={f.key}
                className="vendingmachine__float"
                style={{ ["--float-drift" as string]: `${f.drift}px` }}
              >
                <Image
                  src={f.icon}
                  alt=""
                  width={96}
                  height={96}
                  className="vendingmachine__float-icon"
                  draggable={false}
                />
                <span className="vendingmachine__float-count">+{f.amount}</span>
              </div>
            ))}
          </div>

          <div className="vendingmachine__machine">
            <Image
              key={style}
              src={`/assets/coffee-machines/${style}.png`}
              alt=""
              width={420}
              height={640}
              priority
              className="vendingmachine__img"
              draggable={false}
            />
          </div>
        </div>

        {unlockedMultipliers.length > 0 ? (
          <div className="vendingmachine__multipliers" role="group" aria-label="Quick pour">
            {unlockedMultipliers.map((value) => {
              const cooling = Boolean(coolingByMultiplier[value]);
              return (
                <button
                  key={value}
                  type="button"
                  className={`vendingmachine__multiplier${
                    pressingMultiplier === value
                      ? " vendingmachine__multiplier--pressed"
                      : ""
                  }${cooling ? " vendingmachine__multiplier--cooling" : ""}`}
                  onClick={() => dispenseMultiplier(value)}
                  disabled={cooling}
                  aria-label={`Get ${value} coffees`}
                  aria-busy={cooling}
                >
                  {cooling ? (
                    <span
                      key={cooldownTokens[value] ?? 0}
                      className="vendingmachine__multiplier-charge"
                      style={{
                        ["--charge-ms" as string]: `${MULTIPLIER_COOLDOWN_MS}ms`,
                      }}
                      aria-hidden
                    >
                      <svg viewBox="0 0 40 40" className="vendingmachine__multiplier-charge-svg">
                        <circle
                          className="vendingmachine__multiplier-charge-track"
                          cx="20"
                          cy="20"
                          r="17"
                          fill="none"
                        />
                        <circle
                          className="vendingmachine__multiplier-charge-progress"
                          cx="20"
                          cy="20"
                          r="17"
                          fill="none"
                        />
                      </svg>
                    </span>
                  ) : null}
                  <span className="vendingmachine__multiplier-label">×{value}</span>
                </button>
              );
            })}
          </div>
        ) : null}

        <button
          type="button"
          className={`vendingmachine__pour${isPressing ? " vendingmachine__pour--pressed" : ""}${pourNudge ? " vendingmachine__pour--nudge" : ""}`}
          onClick={() => dispense(1)}
          aria-label="Get coffee"
        >
          <span className="vendingmachine__pour-face">Get coffee</span>
        </button>
      </section>

      <section
        className="vendingmachine-pager__page vendingmachine-pager__page--stats"
        aria-label="Collection"
      >
        <CoffeeStats
          counts={counts}
          onNavigateToMachine={() => scrollPager(-1)}
        />
      </section>

      {coffeeUnlockOpen ? (
        <div
          className="vendingmachine__modal"
          role="dialog"
          aria-modal="true"
          aria-label={`Unlocked ${unlockedCoffee.label}`}
        >
          <button
            type="button"
            className="vendingmachine__modal-close"
            onClick={closeCoffeeUnlockModal}
            aria-label="Close"
          >
            ×
          </button>
          <div className="vendingmachine__modal-body">
            <Image
              src={unlockedCoffee.icon}
              alt={unlockedCoffee.label}
              width={720}
              height={900}
              className="vendingmachine__modal-cup"
              priority
            />
            <p className="vendingmachine__modal-verdict">
              {unlockedCoffee.label}
            </p>
            <p className="vendingmachine__modal-desc">
              {unlockedCoffee.description}
            </p>
          </div>
        </div>
      ) : null}

      {storyUnlockOpen && pendingStoryEpisode ? (
        <div
          className="vendingmachine__modal"
          role="dialog"
          aria-modal="true"
          aria-label={`Unlocked episode ${pendingStoryEpisode.ep}`}
        >
          <button
            type="button"
            className="vendingmachine__modal-close"
            onClick={closeStoryUnlockModal}
            aria-label="Close"
          >
            ×
          </button>
          <div className="vendingmachine__modal-body">
            <p className="vendingmachine__modal-kicker">Story unlocked</p>
            <p className="vendingmachine__modal-verdict">
              EP {pendingStoryEpisode.ep}
            </p>
            <p className="vendingmachine__modal-story-title">
              {pendingStoryEpisode.title}
            </p>
            <p className="vendingmachine__modal-desc">
              {pendingStoryEpisode.body}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default VendingMachine;
