"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import { useHomeData, type Owner } from "@/pwa/modules/home/hooks/useHomeData";
import { TopBar } from "@/pwa/modules/home/componentes/TopBar";
import { BottomNav } from "@/pwa/modules/home/componentes/BottomNav";
import { MonthSummaryCard } from "@/pwa/modules/transacoes/componentes/MonthSummaryCard";
import { StatementList } from "@/pwa/modules/transacoes/componentes/StatementList";
import { FilterModal } from "@/pwa/modules/transacoes/componentes/FilterModal";
import { StatementSkeleton } from "@/pwa/modules/transacoes/componentes/StatementSkeleton";
import { getBankDot } from "@/pwa/modules/transacoes/componentes/statementVisual";
import {
  EMPTY_ADVANCED_FILTERS,
  applyFilters,
  countAdvancedFilters,
  currentMonth,
  downloadStatementCsv,
  formatMonthRange,
  groupByDay,
  isInMonth,
  toStatementAccount,
  toStatementEntries,
  type AdvancedFilters,
  type MonthKey,
  type QuickFilter,
} from "@/pwa/modules/transacoes/statementUtils";

const pillBase =
  "filter-pill flex items-center px-3.5 h-9 rounded-full flex-shrink-0 active:scale-95 transition-all";
const pillActive = "bg-primary text-on-primary";
const pillIdle = "bg-surface-container-lowest text-on-surface-variant shadow-sm";

interface TransactionsPageProps {
  owner: Owner;
}

export function TransactionsPage({ owner }: TransactionsPageProps) {
  const { data, error, isLoading } = useHomeData(owner);
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState<MonthKey>(currentMonth);
  const [quick, setQuick] = useState<QuickFilter>("all");
  const [advanced, setAdvanced] = useState<AdvancedFilters>(EMPTY_ADVANCED_FILTERS);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const closeFilter = useCallback(() => setIsFilterOpen(false), []);

  const accounts = useMemo(
    () => (data?.accounts ?? []).map(toStatementAccount),
    [data?.accounts]
  );
  const entries = useMemo(() => toStatementEntries(data?.accounts ?? []), [data?.accounts]);
  const monthEntries = useMemo(
    () => entries.filter((entry) => isInMonth(entry, month)),
    [entries, month]
  );

  // Most frequent categories first, so the modal leads with the useful ones.
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const entry of monthEntries) {
      counts.set(entry.categoryLabel, (counts.get(entry.categoryLabel) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([category]) => category);
  }, [monthEntries]);

  const filtered = useMemo(
    () => applyFilters(monthEntries, { search, quick, advanced }),
    [monthEntries, search, quick, advanced]
  );
  const groups = useMemo(() => groupByDay(filtered), [filtered]);

  const summary = useMemo(() => {
    const credits = filtered.filter((entry) => entry.type === "CREDIT");
    const debits = filtered.filter((entry) => entry.type === "DEBIT");
    const sum = (list: typeof filtered) =>
      list.reduce((total, entry) => total + Math.abs(entry.amount), 0);
    return {
      income: sum(credits),
      incomeCount: credits.length,
      expenses: sum(debits),
      expensesCount: debits.length,
    };
  }, [filtered]);

  const advancedCount = countAdvancedFilters(advanced);
  const hasAnyFilter = search.trim() !== "" || quick !== "all" || advancedCount > 0;

  const filterDescription = useMemo(() => {
    const parts = [formatMonthRange(month)];
    if (quick.startsWith("account:")) {
      const account = accounts.find((a) => `account:${a.id}` === quick);
      parts.push(account?.label ?? "1 conta");
    } else if (advanced.accountIds.length === 1) {
      parts.push(accounts.find((a) => a.id === advanced.accountIds[0])?.label ?? "1 conta");
    } else if (advanced.accountIds.length > 1) {
      parts.push(`${advanced.accountIds.length} contas`);
    } else {
      parts.push("Todas Contas");
    }
    if (quick === "in") parts.push("Entradas");
    if (quick === "out") parts.push("Saídas");
    if (advanced.categories.length === 1) parts.push(advanced.categories[0]);
    if (advanced.categories.length > 1) parts.push(`${advanced.categories.length} categorias`);
    return parts;
  }, [month, quick, advanced, accounts]);

  function clearFilters() {
    setSearch("");
    setQuick("all");
    setAdvanced(EMPTY_ADVANCED_FILTERS);
  }

  return (
    <div className="font-pwa bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen flex flex-col">
      <TopBar owner={owner} title="Transações" />
      <main className="flex-1 flex flex-col relative w-full pt-16 pb-28 bg-surface px-margin">
        <div className="flex flex-col w-full space-y-4">
          <div className="flex items-center justify-between pt-1">
            <div>
              <span className="text-headline-lg text-on-surface tracking-tight block">Extrato</span>
              <span className="text-body-sm text-on-surface-variant">
                Visão consolidada de todas as contas
              </span>
            </div>
            <div className="flex items-center gap-space-xs">
              <button
                type="button"
                aria-label="Exportar extrato"
                onClick={() => downloadStatementCsv(filtered, month)}
                disabled={filtered.length === 0}
                className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant active:scale-90 transition-transform disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[20px]">ios_share</span>
              </button>
              <button
                type="button"
                aria-label="Configurar filtros"
                onClick={() => setIsFilterOpen(true)}
                className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-[20px]">tune</span>
              </button>
            </div>
          </div>

          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por loja, valor ou categoria..."
              className="w-full h-12 pl-11 pr-10 rounded-xl bg-surface-container-lowest text-on-surface text-body-md shadow-[0_2px_12px_rgba(26,26,26,0.03)] placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Limpar busca"
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">cancel</span>
              </button>
            )}
          </div>

          <MonthSummaryCard month={month} onChangeMonth={setMonth} {...summary} />

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 -mx-margin px-margin">
            <button
              type="button"
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-1.5 px-3.5 h-9 rounded-full bg-primary-fixed text-on-primary-fixed flex-shrink-0 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              <span className="text-label-md">Filtros</span>
              {advancedCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-primary text-on-primary text-label-sm flex items-center justify-center">
                  {advancedCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setQuick("all")}
              className={`${pillBase} gap-1 ${quick === "all" ? pillActive : pillIdle}`}
            >
              <span className="text-label-md">Todas</span>
            </button>
            <button
              type="button"
              onClick={() => setQuick("in")}
              className={`${pillBase} gap-1 ${quick === "in" ? pillActive : pillIdle}`}
            >
              <span
                className={`material-symbols-outlined text-[16px] ${
                  quick === "in" ? "" : "text-secondary"
                }`}
              >
                north_east
              </span>
              <span className="text-label-md">Entradas</span>
            </button>
            <button
              type="button"
              onClick={() => setQuick("out")}
              className={`${pillBase} gap-1 ${quick === "out" ? pillActive : pillIdle}`}
            >
              <span
                className={`material-symbols-outlined text-[16px] ${
                  quick === "out" ? "" : "text-tertiary"
                }`}
              >
                south_west
              </span>
              <span className="text-label-md">Saídas</span>
            </button>
            {accounts.map((account) => {
              const key: QuickFilter = `account:${account.id}`;
              return (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => setQuick(key)}
                  className={`${pillBase} gap-1.5 ${quick === key ? pillActive : pillIdle}`}
                >
                  <span className={`w-2 h-2 rounded-full ${getBankDot(account.name)}`} />
                  <span className="text-label-md">{account.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between bg-surface-container-low px-3 py-2 rounded-xl text-on-surface-variant">
            <div className="flex items-center gap-1.5 overflow-hidden text-body-sm">
              <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
              <span className="truncate">
                Filtrando:{" "}
                {filterDescription.map((part, index) => (
                  <span key={part}>
                    {index > 0 && " • "}
                    <strong>{part}</strong>
                  </span>
                ))}
              </span>
            </div>
            {hasAnyFilter && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-primary text-label-sm font-semibold flex-shrink-0 ml-2 hover:underline"
              >
                Limpar
              </button>
            )}
          </div>

          {isLoading && <StatementSkeleton />}
          {error && <p className="text-body-sm text-error">{error}</p>}
          {data && <StatementList groups={groups} />}
        </div>
      </main>

      <AnimatePresence>
        {isFilterOpen && (
          <FilterModal
            onClose={closeFilter}
            accounts={accounts}
            categories={categories}
            value={advanced}
            onApply={setAdvanced}
          />
        )}
      </AnimatePresence>

      <BottomNav active="transacoes" />
    </div>
  );
}
