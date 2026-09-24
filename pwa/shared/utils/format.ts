const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const amountFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** R$ 1.234,56 */
export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

/** R$ 1.234,56, or "R$ •••••" while the eye toggle hides values */
export function formatCurrencyMasked(value: number, isHidden: boolean): string {
  return isHidden ? "R$ •••••" : currencyFormatter.format(value);
}

/** 1.234,56 (no currency symbol) */
export function formatAmount(value: number): string {
  return amountFormatter.format(value);
}

/** + R$ 1.234,56 / - R$ 1.234,56 */
export function formatSignedCurrency(value: number): string {
  return `${value >= 0 ? "+" : "-"} ${currencyFormatter.format(Math.abs(value))}`;
}

/** Reads what the user typed in a money field ("1.234,56", "R$ 50") as a number */
export function parseAmountInput(value: string): number | null {
  const cleaned = value
    .replace(/[^\d,.]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  if (!cleaned) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

/** 14:30 */
export function formatTime(date: Date | string): string {
  return timeFormatter.format(new Date(date));
}

/** 24/09 14:30 */
export function formatDateTime(date: Date | string): string {
  return dateTimeFormatter.format(new Date(date));
}

/** Calendar days between today and `date`: 0 = today, 1 = yesterday, -1 = tomorrow */
export function daysAgo(date: Date | string): number {
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return Math.round((startOfDay(new Date()) - startOfDay(new Date(date))) / MS_PER_DAY);
}

/** "Gabriel Carvalho" → "GC", "Nubank" → "NU" */
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}
