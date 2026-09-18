import type { TransactionGroup, TransactionItem } from "@/pwa/modules/home/hooks/useHomeData";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

const CATEGORY_ICONS: { match: RegExp; icon: string; tone: string }[] = [
  { match: /restaur|bar|food|refei/i, icon: "restaurant", tone: "bg-error-container text-error" },
  { match: /transport|uber|taxi|combust/i, icon: "directions_car", tone: "bg-surface-container-high text-on-surface" },
  { match: /pix|transfer/i, icon: "bolt", tone: "bg-secondary-container text-secondary" },
  { match: /market|mercado|supermerc|grocer/i, icon: "shopping_cart", tone: "bg-primary-fixed text-primary" },
  { match: /stream|netflix|assinatura|subscription/i, icon: "smart_display", tone: "bg-tertiary-fixed text-tertiary" },
  { match: /salário|salary|income|renda/i, icon: "payments", tone: "bg-secondary-container text-secondary" },
];

function getCategoryVisual(transaction: TransactionItem) {
  const haystack = `${transaction.category ?? ""} ${transaction.description}`;
  const match = CATEGORY_ICONS.find((entry) => entry.match.test(haystack));
  if (match) return match;
  return transaction.type === "CREDIT"
    ? { icon: "call_received", tone: "bg-secondary-container text-secondary" }
    : { icon: "receipt_long", tone: "bg-surface-container-high text-on-surface" };
}

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
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between py-1"
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
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
