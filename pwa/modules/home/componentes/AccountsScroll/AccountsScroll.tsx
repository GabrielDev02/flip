"use client";

import { useState } from "react";
import type { AccountCard } from "@/pwa/modules/home/hooks/useHomeData";
import { formatCurrency } from "@/pwa/shared/utils/format";

const BANK_BADGE_STYLES = [
  "bg-primary text-on-primary",
  "bg-tertiary-container text-on-tertiary-container",
  "bg-secondary-container text-on-secondary-container",
  "bg-inverse-surface text-inverse-on-surface",
];

interface AccountsScrollProps {
  title: string;
  cards: AccountCard[];
  isHidden: boolean;
  /** "bank" shows the account's initials; "debt" shows a card icon and red amounts */
  variant: "bank" | "debt";
  /** Cards shown before the "Ver mais" button; all of them when omitted */
  maxVisible?: number;
}

export function AccountsScroll({ title, cards, isHidden, variant, maxVisible }: AccountsScrollProps) {
  const [expanded, setExpanded] = useState(false);

  if (cards.length === 0) return null;

  const hasMore = maxVisible !== undefined && cards.length > maxVisible;
  const visibleCards = hasMore && !expanded ? cards.slice(0, maxVisible) : cards;
  const isDebt = variant === "debt";

  return (
    <section className="flex flex-col space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-headline-sm text-on-surface">{title}</h2>
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
            {isDebt ? (
              <div className="w-10 h-10 rounded-full bg-error-container text-error flex items-center justify-center shrink-0 shadow-inner">
                <span className="material-symbols-outlined text-[18px]">credit_card</span>
              </div>
            ) : (
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-inner shrink-0 ${
                  BANK_BADGE_STYLES[index % BANK_BADGE_STYLES.length]
                }`}
              >
                {card.initials}
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-label-sm text-on-surface-variant truncate">
                {card.label}
              </span>
              <span
                className={`text-label-lg font-bold truncate ${isDebt ? "text-error" : "text-on-surface"}`}
              >
                {isHidden ? "••••••" : formatCurrency(card.amount)}
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
