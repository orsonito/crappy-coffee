"use client";

import React from "react";
import Image from "next/image";
import "./coffeestats.css";
import { CoffeeStatsProps } from "./coffeestats.types";
import { useCoffeeStats } from "./coffeestats.hooks";

const CoffeeStats = ({ counts, onNavigateToMachine }: CoffeeStatsProps) => {
  const { slots, selected, openSlot, closeDetail } = useCoffeeStats({ counts });

  return (
    <div className="coffeestats">
      <button
        type="button"
        className="coffeestats__nav-arrow coffeestats__nav-arrow--left"
        onClick={onNavigateToMachine}
        aria-label="Go to machine"
      >
        ‹
      </button>

      <div className="coffeestats__body">
        <h2 className="coffeestats__title">COLLECTION</h2>

        <ul className="coffeestats__grid" aria-label="Coffee collection">
          {slots.map((slot) => (
            <li key={slot.id} className="coffeestats__cell-item">
              {slot.unlocked ? (
                <button
                  type="button"
                  className="coffeestats__cell"
                  onClick={() => openSlot(slot)}
                  aria-label={`${slot.label}, obtained ${slot.count} times`}
                >
                  <div className="coffeestats__icon-wrap">
                    <Image
                      src={slot.icon}
                      alt=""
                      width={128}
                      height={128}
                      className="coffeestats__icon"
                      draggable={false}
                    />
                  </div>
                  <span className="coffeestats__count">{slot.count}</span>
                </button>
              ) : (
                <div className="coffeestats__cell coffeestats__cell--locked">
                  <div className="coffeestats__icon-wrap">
                    <Image
                      src={slot.icon}
                      alt=""
                      width={128}
                      height={128}
                      className="coffeestats__icon"
                      draggable={false}
                    />
                    {slot.hintIcons?.length ? (
                      <div className="coffeestats__hint-icons" aria-hidden>
                        {slot.hintIcons.map((hint) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={hint}
                            src={hint}
                            alt=""
                            width={28}
                            height={28}
                            className={`coffeestats__hint-icon${
                              hint.includes("question")
                                ? " coffeestats__hint-icon--q"
                                : ""
                            }`}
                            draggable={false}
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <span className="coffeestats__count">{slot.count}</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {selected ? (
        <div
          className="coffeestats__modal"
          role="dialog"
          aria-modal="true"
          aria-label={selected.label}
          onClick={closeDetail}
        >
          <div className="coffeestats__modal-body">
            <Image
              src={selected.icon}
              alt={selected.label}
              width={320}
              height={320}
              className="coffeestats__modal-icon"
              priority
            />
            <p className="coffeestats__modal-title">{selected.label}</p>
            <p className="coffeestats__modal-desc">{selected.description}</p>
            <p className="coffeestats__modal-count">×{selected.count}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default CoffeeStats;
