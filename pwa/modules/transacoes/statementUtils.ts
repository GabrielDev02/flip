import type { Account, Transaction } from "@/pwa/modules/home/hooks/useHomeData";
import { getCategoryLabel } from "@/pwa/modules/transacoes/componentes/statementVisual";

const MONTH_NAMES = [
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

export interface StatementAccount {
  id: string;
  name: string;
  type: Account["type"];
  /** Short label for chips and checkboxes */
  label: string;
  /** Label shown under each transaction */
  sourceLabel: string;
}

export interface StatementEntry extends Transaction {
  account: StatementAccount;
  categoryLabel: string;
}

export function toStatementAccount(account: Account): StatementAccount {
  const isCard = account.type === "CREDIT";
  return {
    id: account.id,
    name: account.name,
    type: account.type,
    label: isCard ? `Cartão ${account.name}` : account.name,
    sourceLabel: isCard ? `Cartão ${account.name}` : `Conta ${account.name}`,
  };
}

export function toStatementEntries(accounts: Account[]): StatementEntry[] {
  return accounts
    .flatMap((account) => {
      const statementAccount = toStatementAccount(account);
      return account.transactions.map((transaction) => ({
        ...transaction,
        account: statementAccount,
        categoryLabel: getCategoryLabel(transaction.category),
      }));
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export type QuickFilter = "all" | "in" | "out" | `account:${string}`;

export interface AdvancedFilters {
  /** Empty means every account */
  accountIds: string[];
  /** Empty means every category */
  categories: string[];
  minAmount: number | null;
  maxAmount: number | null;
}

export const EMPTY_ADVANCED_FILTERS: AdvancedFilters = {
  accountIds: [],
  categories: [],
  minAmount: null,
  maxAmount: null,
};

export function countAdvancedFilters(filters: AdvancedFilters): number {
  return (
    (filters.accountIds.length > 0 ? 1 : 0) +
    (filters.categories.length > 0 ? 1 : 0) +
    (filters.minAmount !== null || filters.maxAmount !== null ? 1 : 0)
  );
}

export function isInMonth(entry: StatementEntry, { year, month }: MonthKey): boolean {
  const date = new Date(entry.date);
  return date.getFullYear() === year && date.getMonth() === month;
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function matchesSearch(entry: StatementEntry, search: string): boolean {
  const term = normalize(search.trim());
  if (!term) return true;
  const amount = Math.abs(entry.amount);
  const haystack = normalize(
    [
      entry.description,
      entry.categoryLabel,
      entry.category ?? "",
      entry.account.sourceLabel,
      amount.toFixed(2),
      amount.toFixed(2).replace(".", ","),
    ].join(" ")
  );
  return haystack.includes(term);
}

export function applyFilters(
  entries: StatementEntry[],
  { search, quick, advanced }: { search: string; quick: QuickFilter; advanced: AdvancedFilters }
): StatementEntry[] {
  return entries.filter((entry) => {
    if (quick === "in" && entry.type !== "CREDIT") return false;
    if (quick === "out" && entry.type !== "DEBIT") return false;
    if (quick.startsWith("account:") && entry.account.id !== quick.slice("account:".length)) {
      return false;
    }
    if (advanced.accountIds.length > 0 && !advanced.accountIds.includes(entry.account.id)) {
      return false;
    }
    if (advanced.categories.length > 0 && !advanced.categories.includes(entry.categoryLabel)) {
      return false;
    }
    const amount = Math.abs(entry.amount);
    if (advanced.minAmount !== null && amount < advanced.minAmount) return false;
    if (advanced.maxAmount !== null && amount > advanced.maxAmount) return false;
    return matchesSearch(entry, search);
  });
}

export function signedAmount(entry: Transaction): number {
  return entry.type === "CREDIT" ? Math.abs(entry.amount) : -Math.abs(entry.amount);
}

export interface StatementGroup {
  key: string;
  label: string;
  net: number;
  items: StatementEntry[];
}

function dayLabel(date: Date): string {
  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round(
    (startOfDay(now).getTime() - startOfDay(date).getTime()) / (1000 * 60 * 60 * 24)
  );
  const base = `${date.getDate()} de ${MONTH_NAMES[date.getMonth()]}`;
  const withYear = date.getFullYear() === now.getFullYear() ? base : `${base} de ${date.getFullYear()}`;

  if (diffDays === 0) return `Hoje, ${withYear}`;
  if (diffDays === 1) return `Ontem, ${withYear}`;
  return withYear;
}

export function groupByDay(entries: StatementEntry[]): StatementGroup[] {
  const groups = new Map<string, StatementGroup>();
  for (const entry of entries) {
    const date = new Date(entry.date);
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    let group = groups.get(key);
    if (!group) {
      group = { key, label: dayLabel(date), net: 0, items: [] };
      groups.set(key, group);
    }
    group.items.push(entry);
    group.net += signedAmount(entry);
  }
  return Array.from(groups.values());
}

function csvCell(value: string): string {
  return /[";\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function downloadStatementCsv(entries: StatementEntry[], month: MonthKey) {
  const header = ["Data", "Descrição", "Categoria", "Conta", "Tipo", "Valor"];
  const rows = entries.map((entry) => [
    new Date(entry.date).toLocaleString("pt-BR"),
    entry.description,
    entry.categoryLabel,
    entry.account.sourceLabel,
    entry.type === "CREDIT" ? "Entrada" : "Saída",
    signedAmount(entry).toFixed(2).replace(".", ","),
  ]);
  // BOM + ";" so Excel pt-BR opens it with accents and columns intact
  const csv = "﻿" + [header, ...rows].map((row) => row.map(csvCell).join(";")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `extrato-${month.year}-${String(month.month + 1).padStart(2, "0")}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
