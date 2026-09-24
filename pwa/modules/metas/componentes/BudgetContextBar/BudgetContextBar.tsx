import { formatMonthLabel, type MonthKey } from "@/pwa/shared/utils/month";

interface BudgetContextBarProps {
  month: MonthKey;
}

export function BudgetContextBar({ month }: BudgetContextBarProps) {
  return (
    <div className="flex items-center pt-2">
      <button
        type="button"
        title="Em breve"
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-container shadow-sm active:scale-95 transition-transform text-on-surface"
      >
        <span className="material-symbols-outlined text-[18px] text-primary">calendar_month</span>
        <span className="text-label-lg font-semibold">{formatMonthLabel(month)}</span>
        <span className="material-symbols-outlined text-[16px] text-on-surface-variant">expand_more</span>
      </button>
    </div>
  );
}
