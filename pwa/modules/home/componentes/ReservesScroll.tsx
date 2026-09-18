"use client";

import { useState } from "react";
import type { AccountCard } from "@/pwa/modules/home/hooks/useHomeData";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const MAX_VISIBLE = 5;

const BADGE_STYLES = [
  "bg-secondary-container text-on-secondary-container",
  "bg-tertiary-fixed text-tertiary",
  "bg-primary-fixed text-primary",
  "bg-surface-container-high text-on-surface",
];

interface ReservesScrollProps {
  cards: AccountCard[];
}

export function ReservesScroll({ cards }: ReservesScrollProps) {
  const [expanded, setExpanded] = useState(false);

  if (cards.length === 0) return null;

  const visibleCards = expanded ? cards : cards.slice(0, MAX_VISIBLE);
  const hasMore = cards.length > MAX_VISIBLE;

  return (
    <section className="flex flex-col space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-headline-sm text-on-surface">Minhas Reservas</h2>
        <span className="text-label-sm text-on-surface-variant flex items-center gap-0.5">
          Deslize para ver mais
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </span>
      </div>
      <div className="flex overflow-x-auto no-scrollbar gap-3 pb-1 pt-1 -mx-margin px-margin">
        {visibleCards.map((card, index) => (
          <div
            key={card.id}
            className="bg-surface-container-lowest rounded-2xl p-3.5 shadow-sm min-w-[155px] flex items-center gap-3 shrink-0"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-inner shrink-0 ${
                BADGE_STYLES[index % BADGE_STYLES.length]
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">savings</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-label-sm text-on-surface-variant truncate">
                {card.label}
              </span>
              <span className="text-label-lg font-bold text-on-surface truncate">
                {currencyFormatter.format(card.amount)}
              </span>
            </div>
          </div>
        ))}

        {hasMore && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="bg-surface-container-lowest rounded-2xl p-3.5 shadow-sm min-w-[110px] flex flex-col items-center justify-center gap-1 shrink-0 text-primary hover:bg-surface-container-low transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">
              {expanded ? "expand_less" : "expand_more"}
            </span>
            <span className="text-label-sm font-semibold">
              {expanded ? "Ver menos" : "Ver mais"}
            </span>
          </button>
        )}
      </div>
    </section>
  );
}
