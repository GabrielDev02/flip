import type { CategoryBudget } from "@/pwa/modules/metas/hooks/useBudgets";
import { CategoryBudgetCard } from "@/pwa/modules/metas/componentes/CategoryBudgetCard/CategoryBudgetCard";

interface CategoryBudgetListProps {
  categories: CategoryBudget[];
  isHidden: boolean;
  onCreate: () => void;
  onSelect: (budget: CategoryBudget) => void;
}

export function CategoryBudgetList({ categories, isHidden, onCreate, onSelect }: CategoryBudgetListProps) {
  return (
    <section className="flex flex-col gap-3 pt-1">
      <div className="flex items-center gap-2 px-1">
        <h2 className="text-headline-sm text-on-surface">Categorias</h2>
        <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-label-sm font-semibold">
          {categories.length} {categories.length === 1 ? "ativa" : "ativas"}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {categories.map((budget) => (
          <CategoryBudgetCard
            key={budget.id}
            budget={budget}
            isHidden={isHidden}
            onSelect={() => onSelect(budget)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onCreate}
        className="mt-2 w-full h-[52px] rounded-xl bg-surface-container-high active:bg-surface-container-highest text-on-surface flex items-center justify-center gap-2 text-label-lg font-semibold transition-all"
      >
        <span className="material-symbols-outlined text-[20px] text-primary">add_circle</span>
        Criar Nova Categoria de Meta
      </button>
    </section>
  );
}
