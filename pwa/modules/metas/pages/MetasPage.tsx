"use client";

import { useCallback, useState } from "react";
import { AnimatePresence } from "motion/react";
import type { Owner } from "@/pwa/shared/types/owner";
import { useBalanceHidden } from "@/pwa/shared/hooks/useBalanceHidden";
import { useBudgets } from "@/pwa/modules/metas/hooks/useBudgets";
import { TopBar } from "@/pwa/shared/componentes/TopBar/TopBar";
import { BottomNav } from "@/pwa/shared/componentes/BottomNav/BottomNav";
import { BudgetContextBar } from "@/pwa/modules/metas/componentes/BudgetContextBar/BudgetContextBar";
import { BudgetHeroCard } from "@/pwa/modules/metas/componentes/BudgetHeroCard/BudgetHeroCard";
import { CategoryBudgetList } from "@/pwa/modules/metas/componentes/CategoryBudgetList/CategoryBudgetList";
import { EmptyBudgets } from "@/pwa/modules/metas/componentes/EmptyBudgets/EmptyBudgets";
import { BudgetsSkeleton } from "@/pwa/modules/metas/componentes/BudgetsSkeleton/BudgetsSkeleton";
import { CreateBudgetModal } from "@/pwa/modules/metas/componentes/CreateBudgetModal/CreateBudgetModal";
import { EditBudgetModal } from "@/pwa/modules/metas/componentes/EditBudgetModal/EditBudgetModal";

interface MetasPageProps {
  owner: Owner;
}

export function MetasPage({ owner }: MetasPageProps) {
  const {
    month,
    categories,
    categoryOptions,
    spent,
    planned,
    isLoading,
    error,
    createBudget,
    updateBudgetLimit,
    deleteBudget,
  } = useBudgets(owner);
  const [isHidden, toggleHidden] = useBalanceHidden();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const openCreate = useCallback(() => setIsCreateOpen(true), []);
  const closeCreate = useCallback(() => setIsCreateOpen(false), []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const closeEdit = useCallback(() => setSelectedId(null), []);
  const selectedBudget = categories.find((budget) => budget.id === selectedId);

  return (
    <div className="font-pwa bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen flex flex-col">
      <TopBar owner={owner} title="Metas" />
      <main className="flex-1 flex flex-col relative w-full pt-16 pb-28 bg-surface px-margin">
        <div className="flex flex-col w-full gap-4 pb-6">
          <BudgetContextBar month={month} />

          {error && <p className="text-body-sm text-error">{error}</p>}

          {isLoading ? (
            <BudgetsSkeleton />
          ) : categories.length === 0 ? (
            !error && <EmptyBudgets onCreate={openCreate} />
          ) : (
            <>
              <BudgetHeroCard
                spent={spent}
                planned={planned}
                month={month}
                isHidden={isHidden}
                onToggleHidden={toggleHidden}
              />
              <CategoryBudgetList
                categories={categories}
                isHidden={isHidden}
                onCreate={openCreate}
                onSelect={(budget) => setSelectedId(budget.id)}
              />
            </>
          )}
        </div>
      </main>
      <BottomNav active="metas" />
      <AnimatePresence>
        {isCreateOpen && (
          <CreateBudgetModal
            key="create"
            categoryOptions={categoryOptions}
            onCreate={createBudget}
            onClose={closeCreate}
          />
        )}
        {selectedBudget && (
          <EditBudgetModal
            key={selectedBudget.id}
            budget={selectedBudget}
            onSave={updateBudgetLimit}
            onDelete={deleteBudget}
            onClose={closeEdit}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
