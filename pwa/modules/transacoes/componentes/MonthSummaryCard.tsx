"use client";

import { useRef } from "react";
import { formatMonthLabel, type MonthKey } from "@/pwa/modules/transacoes/statementUtils";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function plural(count: number, singular: string, pluralForm: string) {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

interface MonthSummaryCardProps {
  month: MonthKey;
  onChangeMonth: (month: MonthKey) => void;
  income: number;
  incomeCount: number;
  expenses: number;
  expensesCount: number;
}

export function MonthSummaryCard({
  month,
  onChangeMonth,
  income,
  incomeCount,
  expenses,
  expensesCount,
}: MonthSummaryCardProps) {
  const pickerRef = useRef<HTMLInputElement>(null);
  const net = income - expenses;
  const isPositive = net >= 0;

  function shift(delta: number) {
    const date = new Date(month.year, month.month + delta, 1);
    onChangeMonth({ year: date.getFullYear(), month: date.getMonth() });
  }

  function openPicker() {
    try {
      pickerRef.current?.showPicker();
    } catch {
      pickerRef.current?.focus();
    }
  }

  return (
    <div className="w-full bg-surface-container-lowest rounded-2xl p-4 shadow-[0_4px_20px_-2px_rgba(26,26,26,0.04)]">
      <div className="flex items-center justify-between pb-3">
        <button
          type="button"
          onClick={() => shift(-1)}
          aria-label="Mês anterior"
          className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors active:scale-90"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
        </button>
        <button
          type="button"
          onClick={openPicker}
          className="relative flex items-center gap-1.5 cursor-pointer select-none"
        >
          <span className="material-symbols-outlined text-primary text-[18px]">calendar_month</span>
          <span className="text-headline-sm text-on-surface">{formatMonthLabel(month)}</span>
          <span className="material-symbols-outlined text-on-surface-variant text-[16px]">
            expand_more
          </span>
          <input
            ref={pickerRef}
            type="month"
            tabIndex={-1}
            aria-hidden
            value={`${month.year}-${String(month.month + 1).padStart(2, "0")}`}
            onChange={(event) => {
              const [year, monthNumber] = event.target.value.split("-").map(Number);
              if (year && monthNumber) onChangeMonth({ year, month: monthNumber - 1 });
            }}
            className="absolute inset-0 opacity-0 pointer-events-none"
          />
        </button>
        <button
          type="button"
          onClick={() => shift(1)}
          aria-label="Próximo mês"
          className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors active:scale-90"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2">
        <div className="bg-surface-container-low rounded-xl p-2.5 flex flex-col justify-between">
          <div className="flex items-center gap-1 text-secondary">
            <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
            <span className="text-label-sm font-semibold">Entradas</span>
          </div>
          <div className="mt-1.5">
            <span className="text-label-md text-secondary font-bold truncate block">
              +{currencyFormatter.format(income)}
            </span>
            <span className="text-label-sm text-outline">
              {plural(incomeCount, "depósito", "depósitos")}
            </span>
          </div>
        </div>
        <div className="bg-surface-container-low rounded-xl p-2.5 flex flex-col justify-between">
          <div className="flex items-center gap-1 text-tertiary">
            <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
            <span className="text-label-sm font-semibold">Saídas</span>
          </div>
          <div className="mt-1.5">
            <span className="text-label-md text-tertiary font-bold truncate block">
              -{currencyFormatter.format(expenses)}
            </span>
            <span className="text-label-sm text-outline">
              {plural(expensesCount, "débito", "débitos")}
            </span>
          </div>
        </div>
        <div
          className={`rounded-xl p-2.5 flex flex-col justify-between ${
            isPositive ? "bg-secondary-container/40" : "bg-tertiary-fixed/40"
          }`}
        >
          <div
            className={`flex items-center gap-1 ${
              isPositive ? "text-on-secondary-container" : "text-tertiary"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
            <span className="text-label-sm font-semibold">Balanço</span>
          </div>
          <div className="mt-1.5">
            <span
              className={`text-label-md font-bold truncate block ${
                isPositive ? "text-on-secondary-container" : "text-tertiary"
              }`}
            >
              {isPositive ? "+" : "-"}
              {currencyFormatter.format(Math.abs(net))}
            </span>
            <span className={`text-label-sm ${isPositive ? "text-secondary" : "text-tertiary"}`}>
              {isPositive ? "Positivo" : "Negativo"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
