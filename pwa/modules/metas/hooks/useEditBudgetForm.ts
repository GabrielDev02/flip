"use client";

import { useState } from "react";
import type { CategoryBudget } from "@/pwa/modules/metas/hooks/useBudgets";
import { getBudgetProgress } from "@/pwa/modules/metas/utils/budget";
import { formatAmount, parseAmountInput } from "@/pwa/shared/utils/format";

interface EditBudgetActions {
  onSave: (id: string, limit: number) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onDone: () => void;
}

export function useEditBudgetForm(budget: CategoryBudget, { onSave, onDelete, onDone }: EditBudgetActions) {
  const [limitInput, setLimitInput] = useState(() => formatAmount(budget.limit));
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const limit = parseAmountInput(limitInput);
  const isValid = limit !== null && limit > 0;
  // Previews the typed limit, so the bar reacts before saving
  const progress = getBudgetProgress(budget.spent, isValid ? limit : budget.limit);

  function adjust(delta: number) {
    const next = Math.max((limit ?? budget.limit) + delta, 0);
    setLimitInput(formatAmount(next));
  }

  async function run(action: () => Promise<void>, fallbackError: string) {
    setIsBusy(true);
    setError(null);
    try {
      await action();
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : fallbackError);
      setIsBusy(false);
    }
  }

  function save() {
    if (!isValid || isBusy) return;
    run(() => onSave(budget.id, limit), "Não foi possível salvar o limite");
  }

  // First tap asks for confirmation, second tap deletes
  function remove() {
    if (isBusy) return;
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
      return;
    }
    run(() => onDelete(budget.id), "Não foi possível apagar a meta");
  }

  return {
    limitInput,
    setLimitInput,
    adjust,
    progress,
    canSave: isValid && limit !== budget.limit,
    isConfirmingDelete,
    isBusy,
    error,
    save,
    remove,
  };
}
