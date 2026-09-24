export const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export interface MonthKey {
  year: number;
  /** 0-based, like Date#getMonth */
  month: number;
}

export function currentMonth(): MonthKey {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
}

export function formatMonthLabel({ year, month }: MonthKey): string {
  return `${MONTH_NAMES[month]} ${year}`;
}

export function formatMonthRange({ year, month }: MonthKey): string {
  const lastDay = new Date(year, month + 1, 0).getDate();
  return `01 a ${lastDay} ${MONTH_NAMES[month]}`;
}

/** Last day of the month, e.g. "30 de Setembro" */
export function formatMonthEnd({ year, month }: MonthKey): string {
  return `${new Date(year, month + 1, 0).getDate()} de ${MONTH_NAMES[month]}`;
}

/** The month `delta` months away, e.g. -1 for the previous one */
export function shiftMonth({ year, month }: MonthKey, delta: number): MonthKey {
  const date = new Date(year, month + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() };
}
