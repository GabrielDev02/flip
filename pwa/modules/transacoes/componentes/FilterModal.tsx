"use client";

import { useEffect, useState } from "react";
import {
  MotionConfig,
  motion,
  useDragControls,
  type PanInfo,
} from "motion/react";
import {
  EMPTY_ADVANCED_FILTERS,
  type AdvancedFilters,
  type StatementAccount,
} from "@/pwa/modules/transacoes/statementUtils";

function parseAmount(value: string): number | null {
  const cleaned = value
    .replace(/[^\d,.]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  if (!cleaned) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatAmountInput(value: number | null): string {
  return value === null ? "" : value.toLocaleString("pt-BR");
}

interface FilterModalProps {
  onClose: () => void;
  accounts: StatementAccount[];
  categories: string[];
  value: AdvancedFilters;
  onApply: (filters: AdvancedFilters) => void;
}

/** Mount only while open (inside AnimatePresence): the draft is seeded from `value` on mount. */
export function FilterModal({
  onClose,
  accounts,
  categories,
  value,
  onApply,
}: FilterModalProps) {
  const [draft, setDraft] = useState(value);
  const [minInput, setMinInput] = useState(formatAmountInput(value.minAmount));
  const [maxInput, setMaxInput] = useState(formatAmountInput(value.maxAmount));
  const dragControls = useDragControls();

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  // An empty accountIds list means "all accounts", so every box starts checked.
  const isAccountChecked = (id: string) =>
    draft.accountIds.length === 0 || draft.accountIds.includes(id);

  function toggleAccount(id: string) {
    const current =
      draft.accountIds.length === 0
        ? accounts.map((a) => a.id)
        : draft.accountIds;
    const next = current.includes(id)
      ? current.filter((a) => a !== id)
      : [...current, id];
    setDraft({
      ...draft,
      accountIds: next.length === accounts.length ? [] : next,
    });
  }

  function toggleCategory(category: string) {
    const next = draft.categories.includes(category)
      ? draft.categories.filter((c) => c !== category)
      : [...draft.categories, category];
    setDraft({ ...draft, categories: next });
  }

  function handleReset() {
    setDraft(EMPTY_ADVANCED_FILTERS);
    setMinInput("");
    setMaxInput("");
  }

  function handleApply() {
    onApply({
      ...draft,
      minAmount: parseAmount(minInput),
      maxAmount: parseAmount(maxInput),
    });
    onClose();
  }

  function handleDragEnd(_event: PointerEvent, info: PanInfo) {
    if (info.offset.y > 120 || info.velocity.y > 500) onClose();
  }

  const chipClass = (isSelected: boolean) =>
    `px-3 py-1.5 rounded-full text-label-sm ${
      isSelected
        ? "bg-primary text-on-primary font-semibold"
        : "bg-surface-container-low text-on-surface-variant"
    }`;

  return (
    <MotionConfig reducedMotion="user">
      <div className="fixed inset-0 z-[60] flex items-end justify-center">
        {/* Backdrop is a sibling so its fade doesn't make the sheet translucent */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="filter-modal-title"
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
          {/* Only the handle area starts a drag, so the scrollable content still scrolls */}
          <div
            onPointerDown={(event) => dragControls.start(event)}
            className="-mx-5 -mt-5 px-5 pt-5 cursor-grab active:cursor-grabbing touch-none"
          >
            <div className="w-10 h-1 bg-surface-variant rounded-full mx-auto mb-4" />
          </div>
          <div className="flex items-center justify-between pb-3">
            <span
              id="filter-modal-title"
              className="text-headline-md text-on-surface"
            >
              Filtros Avançados
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar filtros"
              className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant"
            >
              <span className="material-symbols-outlined text-[20px]">
                close
              </span>
            </button>
          </div>

          <div className="space-y-4 min-h-0 max-h-[530px] overflow-y-auto no-scrollbar py-2">
            <div>
              <span className="text-label-md text-on-surface-variant mb-2 block uppercase tracking-wide font-semibold">
                Instituição Financeira
              </span>
              <div className="grid grid-cols-2 gap-2">
                {accounts.map((account) => (
                  <label
                    key={account.id}
                    className="flex items-center gap-2 p-3 rounded-xl bg-surface-container-low cursor-pointer active:bg-surface-container"
                  >
                    <input
                      type="checkbox"
                      checked={isAccountChecked(account.id)}
                      onChange={() => toggleAccount(account.id)}
                      className="w-4 h-4 rounded text-primary accent-primary"
                    />
                    <span className="text-body-md text-on-surface">
                      {account.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <span className="text-label-md text-on-surface-variant mb-2 block uppercase tracking-wide font-semibold">
                Categorias
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setDraft({ ...draft, categories: [] })}
                  className={chipClass(draft.categories.length === 0)}
                >
                  Todas
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className={chipClass(draft.categories.includes(category))}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-label-md text-on-surface-variant mb-2 block uppercase tracking-wide font-semibold">
                Faixa de Valor
              </span>
              <div className="flex items-center gap-2">
                <label className="flex-1 bg-surface-container-low p-2.5 rounded-xl text-center">
                  <span className="text-outline text-label-sm block">
                    Mínimo
                  </span>
                  <input
                    inputMode="decimal"
                    value={minInput}
                    onChange={(event) => setMinInput(event.target.value)}
                    placeholder="R$ 0,00"
                    className="w-full bg-transparent text-center text-label-md text-on-surface font-bold placeholder:text-on-surface outline-none"
                  />
                </label>
                <span className="text-outline">até</span>
                <label className="flex-1 bg-surface-container-low p-2.5 rounded-xl text-center">
                  <span className="text-outline text-label-sm block">
                    Máximo
                  </span>
                  <input
                    inputMode="decimal"
                    value={maxInput}
                    onChange={(event) => setMaxInput(event.target.value)}
                    placeholder="R$ 10.000+"
                    className="w-full bg-transparent text-center text-label-md text-on-surface font-bold placeholder:text-on-surface outline-none"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 h-12 rounded-xl bg-surface-container text-on-surface text-label-lg font-semibold active:scale-95 transition-all"
            >
              Redefinir
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex-1 h-12 rounded-xl bg-primary text-on-primary text-label-lg font-semibold shadow-md active:scale-95 transition-all"
            >
              Aplicar Filtros
            </button>
          </div>
        </motion.div>
      </div>
    </MotionConfig>
  );
}
