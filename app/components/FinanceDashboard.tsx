"use client";

import { useEffect, useMemo, useState } from "react";
import { TransactionsTable, type TransactionRow } from "@/app/components/TransactionsTable";
import { CategoriesTable } from "@/app/components/CategoriesTable";

type Owner = "gabriel" | "parceiro";

interface RawAccount {
  id: string;
  name: string;
  balance: number;
  transactions: Omit<TransactionRow, "accountName">[];
}

type TransactionFilter = "all" | "expenses" | "income";
type Tab = "transacoes" | "categorias";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

interface FinanceDashboardProps {
  owner: Owner;
}

export function FinanceDashboard({ owner }: FinanceDashboardProps) {
  const [rows, setRows] = useState<TransactionRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("transacoes");
  const [filter, setFilter] = useState<TransactionFilter>("all");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/pluggy/accounts?owner=${owner}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Falha ao buscar dados");

        const accounts: RawAccount[] = data.accounts;
        const flattened = accounts
          .flatMap((account) =>
            account.transactions.map((transaction) => ({
              ...transaction,
              accountName: account.name,
            }))
          )
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        if (!cancelled) setRows(flattened);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erro desconhecido");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [owner]);

  const biggestExpense = useMemo(() => {
    if (!rows) return null;
    const now = new Date();
    const expenses = rows.filter((row) => {
      if (row.type !== "DEBIT") return false;
      const date = new Date(row.date);
      return (
        date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
      );
    });
    if (expenses.length === 0) return null;
    return expenses.reduce((max, row) =>
      Math.abs(row.amount) > Math.abs(max.amount) ? row : max
    );
  }, [rows]);

  const filteredRows = useMemo(() => {
    if (!rows) return [];
    if (filter === "expenses") return rows.filter((row) => row.type === "DEBIT");
    if (filter === "income") return rows.filter((row) => row.type === "CREDIT");
    return rows;
  }, [rows, filter]);

  if (isLoading) {
    return <p className="text-sm text-zinc-500">Carregando transações...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {biggestExpense && (
        <div className="flex flex-col gap-1 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <span className="text-xs uppercase tracking-wide text-zinc-500">
            Maior gasto do mês
          </span>
          <span className="text-2xl font-semibold text-red-600">
            {currencyFormatter.format(Math.abs(biggestExpense.amount))}
          </span>
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            {biggestExpense.description} · {dateFormatter.format(new Date(biggestExpense.date))}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex gap-4">
          <button
            onClick={() => setTab("transacoes")}
            className={`border-b-2 px-1 pb-2 text-sm font-medium transition-colors ${
              tab === "transacoes"
                ? "border-foreground text-foreground"
                : "border-transparent text-zinc-500 hover:text-foreground"
            }`}
          >
            Transações
          </button>
          <button
            onClick={() => setTab("categorias")}
            className={`border-b-2 px-1 pb-2 text-sm font-medium transition-colors ${
              tab === "categorias"
                ? "border-foreground text-foreground"
                : "border-transparent text-zinc-500 hover:text-foreground"
            }`}
          >
            Categorias
          </button>
        </div>

        {tab === "transacoes" && (
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value as TransactionFilter)}
            className="mb-2 rounded-md border border-zinc-300 bg-transparent px-2 py-1 text-sm dark:border-zinc-700"
          >
            <option value="all">Todos</option>
            <option value="expenses">Só gastos</option>
            <option value="income">Só entradas</option>
          </select>
        )}
      </div>

      {tab === "transacoes" ? (
        <TransactionsTable rows={filteredRows} />
      ) : (
        <CategoriesTable rows={rows ?? []} />
      )}
    </div>
  );
}
