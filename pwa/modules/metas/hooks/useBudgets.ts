"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useHomeData } from "@/pwa/modules/home/hooks/useHomeData";
import {
  averageSpendingByCategory,
  describeCategories,
  getBudgetVisual,
  spendingByCategory,
  spendingCategories,
} from "@/pwa/modules/metas/utils/budget";
import type { Owner } from "@/pwa/shared/types/owner";
import { currentMonth } from "@/pwa/shared/utils/month";

interface Budget {
  id: string;
  name: string;
  limit: number;
  categories: string[];
}

export interface NewBudget {
  name: string;
  limit: number;
  categories: string[];
}

export interface CategoryBudget extends Budget {
  description: string;
  icon: string;
  /** Tailwind classes for the icon tile */
  tone: string;
  spent: number;
  /** Average monthly spending over the previous full months */
  averageSpent: number;
}

/** How many past months the "média histórica" looks at */
const HISTORY_MONTHS = 3;

function sumCategories(totals: Map<string, number>, categories: string[]): number {
  return categories.reduce((sum, category) => sum + (totals.get(category) ?? 0), 0);
}

export function useBudgets(owner: Owner) {
  const { data, error: accountsError, isLoading: isLoadingAccounts } = useHomeData(owner);
  const [budgets, setBudgets] = useState<Budget[] | null>(null);
  const [budgetsError, setBudgetsError] = useState<string | null>(null);
  const [month] = useState(currentMonth);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/budgets?owner=${owner}`);
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? "Falha ao buscar metas");
        if (!cancelled) setBudgets(body.budgets);
      } catch (err) {
        if (!cancelled) setBudgetsError(err instanceof Error ? err.message : "Erro desconhecido");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [owner]);

  const transactions = useMemo(
    () => (data?.accounts ?? []).flatMap((account) => account.transactions),
    [data?.accounts]
  );

  const categories = useMemo<CategoryBudget[]>(() => {
    const spentByCategory = spendingByCategory(transactions, month);
    const averageByCategory = averageSpendingByCategory(transactions, month, HISTORY_MONTHS);
    return (budgets ?? []).map((budget) => ({
      ...budget,
      ...getBudgetVisual(budget.categories),
      description: describeCategories(budget.categories),
      spent: sumCategories(spentByCategory, budget.categories),
      averageSpent: sumCategories(averageByCategory, budget.categories),
    }));
  }, [budgets, transactions, month]);

  const categoryOptions = useMemo(() => spendingCategories(transactions), [transactions]);

  const createBudget = useCallback(
    async (budget: NewBudget) => {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner, ...budget }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Falha ao criar meta");
      setBudgets((current) => [...(current ?? []), body.budget]);
    },
    [owner]
  );

  const updateBudgetLimit = useCallback(
    async (id: string, limit: number) => {
      const res = await fetch(`/api/budgets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner, limit }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Falha ao salvar limite");
      setBudgets((current) =>
        (current ?? []).map((budget) => (budget.id === id ? { ...budget, limit } : budget))
      );
    },
    [owner]
  );

  const deleteBudget = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/budgets/${id}?owner=${owner}`, { method: "DELETE" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Falha ao apagar meta");
      setBudgets((current) => (current ?? []).filter((budget) => budget.id !== id));
    },
    [owner]
  );

  return {
    month,
    categories,
    categoryOptions,
    spent: categories.reduce((sum, category) => sum + category.spent, 0),
    planned: categories.reduce((sum, category) => sum + category.limit, 0),
    // Spending needs the accounts too, otherwise every meta would flash at R$ 0
    isLoading: (budgets === null && !budgetsError) || isLoadingAccounts,
    error: budgetsError ?? accountsError,
    createBudget,
    updateBudgetLimit,
    deleteBudget,
  };
}
