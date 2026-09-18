import Link from "next/link";
import type { TransactionGroup } from "@/pwa/modules/home/hooks/useHomeData";
import { getCategoryVisual } from "@/pwa/modules/home/componentes/categoryVisual";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

interface RecentTransactionsProps {
  groups: TransactionGroup[];
}

export function RecentTransactions({ groups }: RecentTransactionsProps) {
  return (
    <section className="flex flex-col space-y-3 pt-1">
      <div className="flex items-center justify-between">
        <h2 className="text-headline-sm text-on-surface">Transações recentes</h2>
        <a
          href="#"
          className="text-label-lg font-semibold text-primary flex items-center gap-1 hover:underline"
        >
          Ver tudo
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </a>
      </div>

      {groups.length === 0 ? (
        <p className="text-body-sm text-on-surface-variant">Nenhuma transação encontrada.</p>
      ) : (
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm space-y-4">
          {groups.map((group) => (
            <div key={group.label} className="space-y-3 first:pt-0 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-label-md font-bold uppercase tracking-wider text-on-surface-variant">
                  {group.label}
                </span>
                <div className="h-px flex-1 bg-surface-container-highest" />
              </div>

              {group.items.map((transaction) => {
                const visual = getCategoryVisual(transaction);
                return (
                  <Link
                    key={transaction.id}
                    href={`/app/home/transacao/${transaction.id}`}
                    className="flex items-center justify-between py-1 -mx-1 px-1 rounded-lg hover:bg-surface-container-low active:scale-[0.99] transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${visual.tone}`}
                      >
                        <span className="material-symbols-outlined text-[22px]">
                          {visual.icon}
                        </span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-label-lg font-semibold text-on-surface truncate">
                          {transaction.description}
                        </span>
                        <span className="text-body-sm text-on-surface-variant">
                          {timeFormatter.format(new Date(transaction.date))}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-label-lg font-bold shrink-0 ${
                        transaction.type === "CREDIT" ? "text-secondary" : "text-error"
                      }`}
                    >
                      {transaction.type === "CREDIT" ? "+ " : "- "}
                      {currencyFormatter.format(Math.abs(transaction.amount))}
                    </span>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
