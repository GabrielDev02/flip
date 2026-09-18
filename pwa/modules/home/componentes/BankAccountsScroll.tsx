import type { AccountCard } from "@/pwa/modules/home/hooks/useHomeData";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const BADGE_STYLES = [
  "bg-primary text-on-primary",
  "bg-tertiary-container text-on-tertiary-container",
  "bg-secondary-container text-on-secondary-container",
  "bg-inverse-surface text-inverse-on-surface",
];

interface BankAccountsScrollProps {
  cards: AccountCard[];
  isHidden: boolean;
}

export function BankAccountsScroll({ cards, isHidden }: BankAccountsScrollProps) {
  if (cards.length === 0) return null;

  return (
    <section className="flex flex-col space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-headline-sm text-on-surface">Meus Bancos &amp; Contas</h2>
        <span className="text-label-sm text-on-surface-variant flex items-center gap-0.5">
          Deslize para ver mais
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </span>
      </div>
      <div className="flex overflow-x-auto no-scrollbar gap-3 pb-1 pt-1 -mx-margin px-margin">
        {cards.map((card, index) => (
          <div
            key={card.id}
            className="bg-surface-container-lowest rounded-2xl p-3.5 shadow-sm min-w-[155px] flex items-center gap-3 shrink-0"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-inner shrink-0 ${
                BADGE_STYLES[index % BADGE_STYLES.length]
              }`}
            >
              {card.initials}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-label-sm text-on-surface-variant truncate">
                {card.label}
              </span>
              <span className="text-label-lg font-bold text-on-surface truncate">
                {isHidden ? "••••••" : currencyFormatter.format(card.amount)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
