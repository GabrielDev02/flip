import type { Transaction } from "@/pwa/modules/home/hooks/useHomeData";
import { getCategoryLabel, getCategoryVisual } from "@/pwa/shared/utils/categoryVisual";
import { shiftMonth, type MonthKey } from "@/pwa/shared/utils/month";
import { isInternalMovement } from "@/pwa/shared/utils/transactions";

/** From this share of the limit on, a category is flagged as "Perto do limite" */
const NEAR_LIMIT_RATIO = 0.85;

export type BudgetStatus = "ok" | "near" | "over";

export const BUDGET_STATUS_STYLES: Record<
  BudgetStatus,
  { bar: string; track: string; text: string; panel: string }
> = {
  ok: {
    bar: "bg-secondary",
    track: "bg-surface-container",
    text: "text-secondary",
    panel: "bg-secondary-container/20 border-secondary-container",
  },
  near: {
    bar: "bg-amber-500",
    track: "bg-surface-container",
    text: "text-amber-700",
    panel: "bg-amber-50/70 border-amber-200/80",
  },
  over: {
    bar: "bg-tertiary",
    track: "bg-error-container/60",
    text: "text-tertiary",
    panel: "bg-tertiary-fixed/40 border-tertiary-fixed",
  },
};

export interface BudgetProgress {
  /** Whole percent of the limit already spent; can go past 100 */
  percent: number;
  /** Negative once the limit is exceeded */
  remaining: number;
  status: BudgetStatus;
}

export function getBudgetProgress(spent: number, limit: number): BudgetProgress {
  const ratio = limit > 0 ? spent / limit : 0;
  return {
    percent: Math.round(ratio * 100),
    remaining: limit - spent,
    status: ratio > 1 ? "over" : ratio >= NEAR_LIMIT_RATIO ? "near" : "ok",
  };
}

/** Spending that can count toward a meta: debits that aren't internal movements */
function isSpending(transaction: Transaction): transaction is Transaction & { category: string } {
  return transaction.type === "DEBIT" && transaction.category !== null && !isInternalMovement(transaction);
}

function isInMonth(transaction: Transaction, { year, month }: MonthKey): boolean {
  const date = new Date(transaction.date);
  return date.getFullYear() === year && date.getMonth() === month;
}

/** Total spent per Pluggy category in the month */
export function spendingByCategory(transactions: Transaction[], month: MonthKey): Map<string, number> {
  const totals = new Map<string, number>();
  for (const transaction of transactions) {
    if (!isSpending(transaction) || !isInMonth(transaction, month)) continue;
    totals.set(
      transaction.category,
      (totals.get(transaction.category) ?? 0) + Math.abs(transaction.amount)
    );
  }
  return totals;
}

/** Average monthly spending per category over the `months` full months before `month` */
export function averageSpendingByCategory(
  transactions: Transaction[],
  month: MonthKey,
  months: number
): Map<string, number> {
  const totals = new Map<string, number>();
  for (let offset = 1; offset <= months; offset++) {
    for (const [category, spent] of spendingByCategory(transactions, shiftMonth(month, -offset))) {
      totals.set(category, (totals.get(category) ?? 0) + spent);
    }
  }
  return new Map(Array.from(totals, ([category, total]) => [category, total / months]));
}

/** Categories the user actually spends on, most frequent first, for the "Nova meta" picker */
export function spendingCategories(transactions: Transaction[]): string[] {
  const counts = new Map<string, number>();
  for (const transaction of transactions) {
    if (!isSpending(transaction)) continue;
    counts.set(transaction.category, (counts.get(transaction.category) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([category]) => category);
}

/** Icon and colors of a meta, taken from its first category */
export function getBudgetVisual(categories: string[]) {
  return getCategoryVisual({ category: categories[0] ?? null, description: "", type: "DEBIT" });
}

/** "Refeição, Delivery" */
export function describeCategories(categories: string[]): string {
  return categories.map(getCategoryLabel).join(", ");
}
