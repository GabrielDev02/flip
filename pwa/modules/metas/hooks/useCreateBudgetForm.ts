"use client";

import { useState } from "react";
import type { NewBudget } from "@/pwa/modules/metas/hooks/useBudgets";
import { parseAmountInput } from "@/pwa/shared/utils/format";

export function useCreateBudgetForm(onCreate: (budget: NewBudget) => Promise<void>, onDone: () => void) {
  const [name, setName] = useState("");
  const [limitInput, setLimitInput] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const limit = parseAmountInput(limitInput);
  const canSubmit = name.trim().length > 0 && limit !== null && limit > 0 && categories.length > 0;

  function toggleCategory(category: string) {
    setCategories((current) =>
      current.includes(category) ? current.filter((c) => c !== category) : [...current, category]
    );
  }

  async function submit() {
    if (!canSubmit || limit === null || isSaving) return;
    setIsSaving(true);
    setError(null);
    try {
      await onCreate({ name: name.trim(), limit, categories });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível criar a meta");
      setIsSaving(false);
    }
  }

  return {
    name,
    setName,
    limitInput,
    setLimitInput,
    categories,
    toggleCategory,
    canSubmit,
    isSaving,
    error,
    submit,
  };
}
