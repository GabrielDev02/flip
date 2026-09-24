"use client";

import { MotionConfig, motion } from "motion/react";
import type { CategoryBudget } from "@/pwa/modules/metas/hooks/useBudgets";
import { useEditBudgetForm } from "@/pwa/modules/metas/hooks/useEditBudgetForm";
import { BUDGET_STATUS_STYLES } from "@/pwa/modules/metas/utils/budget";
import { useModalDismiss } from "@/pwa/shared/hooks/useModalDismiss";
import { formatCurrency } from "@/pwa/shared/utils/format";

const QUICK_ADJUSTMENTS = [-50, 50, 100];

interface EditBudgetModalProps {
  budget: CategoryBudget;
  onSave: (id: string, limit: number) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
}

/** Mount only while open (inside AnimatePresence) so the input starts from the saved limit. */
export function EditBudgetModal({ budget, onSave, onDelete, onClose }: EditBudgetModalProps) {
  const form = useEditBudgetForm(budget, { onSave, onDelete, onDone: onClose });
  useModalDismiss(onClose);

  const { percent, remaining, status } = form.progress;
  const styles = BUDGET_STATUS_STYLES[status];

  return (
    <MotionConfig reducedMotion="user">
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />
        <motion.form
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-budget-title"
          onSubmit={(event) => {
            event.preventDefault();
            form.save();
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-[340px] flex flex-col rounded-3xl bg-surface-container-lowest p-6 shadow-2xl"
        >
          <header className="flex items-center justify-between gap-3 pb-3 border-b border-surface-container">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${budget.tone}`}>
                <span className="material-symbols-outlined text-[20px]">{budget.icon}</span>
              </div>
              <div className="flex flex-col min-w-0">
                <h2 id="edit-budget-title" className="text-label-lg font-bold text-on-surface truncate">
                  {budget.name}
                </h2>
                <span className="text-label-sm font-semibold text-on-surface-variant">Ajuste de Meta</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant shrink-0"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </header>

          <label
            htmlFor="budget-limit-input"
            className="mt-4 mb-2 block text-center text-label-sm font-bold uppercase tracking-wider text-on-surface-variant"
          >
            Limite mensal
          </label>
          <div className="flex items-center justify-center gap-1 rounded-2xl border-2 border-primary bg-primary-fixed/20 py-3 px-4 focus-within:ring-4 focus-within:ring-primary/15 transition-all">
            <span className="text-headline-lg font-extrabold text-on-surface">R$</span>
            <input
              id="budget-limit-input"
              inputMode="decimal"
              value={form.limitInput}
              onChange={(event) => form.setLimitInput(event.target.value)}
              className="w-40 bg-transparent text-headline-lg font-extrabold text-on-surface outline-none"
            />
          </div>

          <div className="mt-3 flex items-center gap-1.5">
            {QUICK_ADJUSTMENTS.map((delta) => (
              <button
                key={delta}
                type="button"
                onClick={() => form.adjust(delta)}
                className="flex-1 py-1.5 rounded-lg bg-surface-container text-label-md font-semibold text-on-surface-variant active:bg-surface-container-high transition-colors"
              >
                {delta > 0 ? "+" : "-"}R$ {Math.abs(delta)}
              </button>
            ))}
          </div>

          <div className={`mt-3.5 rounded-xl border p-3 ${styles.panel}`}>
            <div className="flex items-center justify-between text-label-md mb-1.5 text-on-surface">
              <span className="font-medium">Gasto atual no mês:</span>
              <span className="font-bold">{formatCurrency(budget.spent)}</span>
            </div>
            <div className={`w-full h-2 rounded-full overflow-hidden ${styles.track}`}>
              <div
                className={`h-full rounded-full transition-all ${styles.bar}`}
                style={{ width: `${Math.min(percent, 100)}%` }}
              />
            </div>
            <div className={`mt-1.5 flex items-center justify-between text-label-sm font-medium ${styles.text}`}>
              <span className="flex items-center gap-1">
                {status !== "ok" && (
                  <span className="material-symbols-outlined text-[13px]">warning</span>
                )}
                {percent}% do teto planejado
              </span>
              <span className="font-bold">
                {remaining >= 0 ? "Resta" : "Excedeu"} {formatCurrency(Math.abs(remaining))}
              </span>
            </div>
          </div>

          {budget.averageSpent > 0 && (
            <p className="mt-2 flex items-center justify-center gap-1 text-label-sm font-medium text-on-surface-variant">
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              Média dos últimos 3 meses:{" "}
              <span className="font-semibold text-on-surface">{formatCurrency(budget.averageSpent)}</span>
            </p>
          )}

          {form.error && <p className="mt-3 text-center text-body-sm text-error">{form.error}</p>}

          <footer className="mt-5 flex flex-col gap-2">
            <button
              type="submit"
              disabled={!form.canSave || form.isBusy}
              className="w-full h-12 rounded-2xl bg-primary text-on-primary text-label-lg font-semibold shadow-md flex items-center justify-center gap-2 active:scale-[0.99] transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">check</span>
              Salvar Limite
            </button>
            <button
              type="button"
              onClick={form.remove}
              disabled={form.isBusy}
              className={`w-full h-11 rounded-xl text-label-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${
                form.isConfirmingDelete ? "bg-error text-on-error" : "text-error active:bg-error-container"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
              {form.isConfirmingDelete ? "Toque de novo para apagar" : "Apagar meta"}
            </button>
          </footer>
        </motion.form>
      </div>
    </MotionConfig>
  );
}
