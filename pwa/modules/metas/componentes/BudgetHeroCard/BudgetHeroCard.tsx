import { getBudgetProgress } from "@/pwa/modules/metas/utils/budget";
import { formatCurrencyMasked } from "@/pwa/shared/utils/format";
import { formatMonthEnd, type MonthKey } from "@/pwa/shared/utils/month";

const MOOD_ICONS = {
  ok: "sentiment_satisfied",
  near: "sentiment_neutral",
  over: "sentiment_dissatisfied",
} as const;

interface BudgetHeroCardProps {
  spent: number;
  planned: number;
  month: MonthKey;
  isHidden: boolean;
  onToggleHidden: () => void;
}

export function BudgetHeroCard({ spent, planned, month, isHidden, onToggleHidden }: BudgetHeroCardProps) {
  const { percent, remaining, status } = getBudgetProgress(spent, planned);
  const isOver = status === "over";
  const money = (value: number) => formatCurrencyMasked(value, isHidden);

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary-container to-on-primary-fixed-variant p-6 text-on-primary shadow-lg">
      <div className="pointer-events-none absolute -right-12 -top-12 w-48 h-48 rounded-full bg-surface-container-lowest/10 blur-2xl" />
      <div className="pointer-events-none absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-on-primary-fixed/20 blur-xl" />

      <div className="relative z-10 flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-label-md tracking-wider uppercase text-on-primary/80">
            Orçamento do mês
          </span>
          <button
            type="button"
            onClick={onToggleHidden}
            aria-label={isHidden ? "Mostrar valores" : "Ocultar valores"}
            className="w-7 h-7 rounded-full bg-on-primary/10 hover:bg-on-primary/20 flex items-center justify-center text-on-primary transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isHidden ? "visibility_off" : "visibility"}
            </span>
          </button>
        </div>

        <div className="mt-3 flex items-baseline gap-2 flex-wrap">
          <span className="text-display font-extrabold tracking-tight text-on-primary">
            {money(spent)}
          </span>
          <span className="text-body-md font-medium text-on-primary/80">
            de {money(planned)} planejado
          </span>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <div className="w-full h-3 rounded-full bg-on-primary/20 p-[2px] overflow-hidden">
            <div
              className="h-full bg-surface-container-lowest rounded-full transition-all duration-700 ease-out"
              style={{ width: `${Math.min(percent, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-label-md">
            <span className="font-medium text-on-primary/90">{percent}% utilizado</span>
            <span className="px-2.5 py-0.5 rounded-full bg-on-primary/20 font-semibold text-on-primary">
              {isOver ? "Excedeu" : "Resta"}: {money(Math.abs(remaining))}
            </span>
          </div>
        </div>

        <div className="mt-5 pt-4 flex items-center gap-2 border-t border-on-primary/10 text-on-primary/90">
          <span className="material-symbols-outlined text-[18px] shrink-0 text-secondary-fixed">
            {MOOD_ICONS[status]}
          </span>
          <span className="text-body-sm font-medium">
            {isOver
              ? `Você passou ${money(Math.abs(remaining))} do planejado este mês.`
              : `Você ainda pode gastar ${money(remaining)} até ${formatMonthEnd(month)}.`}
          </span>
        </div>
      </div>
    </section>
  );
}
