"use client";

import { MotionConfig, motion } from "motion/react";
import type { NewBudget } from "@/pwa/modules/metas/hooks/useBudgets";
import { useCreateBudgetForm } from "@/pwa/modules/metas/hooks/useCreateBudgetForm";
import { useBottomSheet } from "@/pwa/shared/hooks/useBottomSheet";
import { getCategoryLabel } from "@/pwa/shared/utils/categoryVisual";

interface CreateBudgetModalProps {
  /** Pluggy categories the user spends on, most frequent first */
  categoryOptions: string[];
  onCreate: (budget: NewBudget) => Promise<void>;
  onClose: () => void;
}

/** Mount only while open (inside AnimatePresence) so the form starts empty each time. */
export function CreateBudgetModal({ categoryOptions, onCreate, onClose }: CreateBudgetModalProps) {
  const form = useCreateBudgetForm(onCreate, onClose);
  const { dragControls, handleDragEnd } = useBottomSheet(onClose);

  const chipClass = (isSelected: boolean) =>
    `px-3 py-1.5 rounded-full text-label-sm ${
      isSelected
        ? "bg-primary text-on-primary font-semibold"
        : "bg-surface-container-low text-on-surface-variant"
    }`;

  return (
    <MotionConfig reducedMotion="user">
      <div className="fixed inset-0 z-[60] flex items-end justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />
        <motion.form
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-budget-title"
          onSubmit={(event) => {
            event.preventDefault();
            form.submit();
          }}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 32, stiffness: 320 }}
          drag="y"
          dragControls={dragControls}
          dragListener={false}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.6 }}
          onDragEnd={handleDragEnd}
          className="relative w-full max-w-md max-h-[92dvh] flex flex-col bg-surface-container-lowest rounded-t-3xl p-5 pb-safe shadow-2xl"
        >
          <div
            onPointerDown={(event) => dragControls.start(event)}
            className="-mx-5 -mt-5 px-5 pt-5 cursor-grab active:cursor-grabbing touch-none"
          >
            <div className="w-10 h-1 bg-surface-variant rounded-full mx-auto mb-4" />
          </div>
          <div className="flex items-center justify-between pb-3">
            <span id="create-budget-title" className="text-headline-md text-on-surface">
              Nova meta
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <div className="space-y-4 min-h-0 overflow-y-auto no-scrollbar py-2">
            <label className="block">
              <span className="text-label-md text-on-surface-variant mb-2 block uppercase tracking-wide font-semibold">
                Nome
              </span>
              <input
                value={form.name}
                onChange={(event) => form.setName(event.target.value)}
                placeholder="Ex.: Restaurantes & iFood"
                maxLength={60}
                className="w-full h-12 px-4 rounded-xl bg-surface-container-low text-body-md text-on-surface placeholder:text-outline outline-none focus:ring-2 focus:ring-primary"
              />
            </label>

            <label className="block">
              <span className="text-label-md text-on-surface-variant mb-2 block uppercase tracking-wide font-semibold">
                Limite por mês
              </span>
              <div className="flex items-center h-12 px-4 rounded-xl bg-surface-container-low focus-within:ring-2 focus-within:ring-primary">
                <span className="text-body-md text-on-surface-variant mr-1">R$</span>
                <input
                  inputMode="decimal"
                  value={form.limitInput}
                  onChange={(event) => form.setLimitInput(event.target.value)}
                  placeholder="0,00"
                  className="flex-1 bg-transparent text-body-md font-semibold text-on-surface placeholder:text-outline outline-none"
                />
              </div>
            </label>

            <div>
              <span className="text-label-md text-on-surface-variant mb-1 block uppercase tracking-wide font-semibold">
                Categorias que contam
              </span>
              <span className="text-body-sm text-on-surface-variant mb-2 block">
                Os gastos dessas categorias entram na meta.
              </span>
              {categoryOptions.length === 0 ? (
                <p className="text-body-sm text-on-surface-variant">
                  Nenhuma categoria de gasto encontrada ainda.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {categoryOptions.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => form.toggleCategory(category)}
                      aria-pressed={form.categories.includes(category)}
                      className={chipClass(form.categories.includes(category))}
                    >
                      {getCategoryLabel(category)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {form.error && <p className="text-body-sm text-error">{form.error}</p>}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={!form.canSubmit || form.isSaving}
              className="w-full h-12 rounded-xl bg-primary text-on-primary text-label-lg font-semibold shadow-md active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
            >
              {form.isSaving ? "Criando..." : "Criar meta"}
            </button>
          </div>
        </motion.form>
      </div>
    </MotionConfig>
  );
}
