import type { CategoryBudget } from "@/pwa/modules/metas/hooks/useBudgets";
import { BUDGET_STATUS_STYLES, getBudgetProgress } from "@/pwa/modules/metas/utils/budget";
import { formatCurrencyMasked } from "@/pwa/shared/utils/format";

interface CategoryBudgetCardProps {
  budget: CategoryBudget;
  isHidden: boolean;
  onSelect: () => void;
}

export function CategoryBudgetCard({ budget, isHidden, onSelect }: CategoryBudgetCardProps) {
  const { percent, remaining, status } = getBudgetProgress(budget.spent, budget.limit);
  const styles = BUDGET_STATUS_STYLES[status];
  const money = (value: number) => formatCurrencyMasked(value, isHidden);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`Ajustar meta ${budget.name}`}
      className="w-full text-left relative overflow-hidden rounded-2xl bg-surface-container-lowest p-4 shadow-[0_4px_20px_-2px_rgba(26,26,26,0.04)] flex flex-col gap-3 transition-transform active:scale-[0.99]"
    >
      {status === "over" && <div className="absolute top-0 right-0 w-2 h-full bg-tertiary" />}

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${budget.tone}`}
          >
            <span className="material-symbols-outlined text-[22px]">{budget.icon}</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-label-lg font-bold text-on-surface truncate">{budget.name}</span>
            {status === "ok" && (
              <span className="text-body-sm text-on-surface-variant truncate">
                {budget.description}
              </span>
            )}
            {status === "near" && (
              <span className="self-start px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                Perto do limite
              </span>
            )}
            {status === "over" && (
              <span className="inline-flex items-center gap-1 text-tertiary text-[11px] font-bold">
                <span className="material-symbols-outlined text-[13px]">warning</span>
                Acima do limite (+{money(Math.abs(remaining))})
              </span>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div
            className={`text-label-lg font-bold ${status === "over" ? "text-tertiary" : "text-on-surface"}`}
          >
            {money(budget.spent)}
          </div>
          <div className="text-label-sm text-on-surface-variant">de {money(budget.limit)}</div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className={`w-full h-2 rounded-full overflow-hidden ${styles.track}`}>
          <div
            className={`h-full rounded-full transition-all duration-500 ${styles.bar}`}
            style={{ width: `${Math.min(percent, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-label-sm">
          <span className={`font-semibold ${styles.text}`}>{percent}% utilizado</span>
          {status === "over" ? (
            <span className="font-semibold text-tertiary">Excedeu o plano mensal</span>
          ) : (
            <span className="font-medium text-on-surface-variant">
              Resta:{" "}
              <strong className={`font-semibold ${status === "near" ? styles.text : "text-on-surface"}`}>
                {money(remaining)}
              </strong>
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
