function EmptyPiggyBank() {
  return (
    <svg viewBox="0 0 160 140" className="w-40 h-36" aria-hidden>
      {/* Coin hovering over the slot, dashed because the piggy is still empty */}
      <g className="animate-bounce [animation-duration:2.4s]">
        <circle cx="81" cy="16" r="10" className="fill-none stroke-outline-variant" strokeWidth="2.5" strokeDasharray="4 3" />
        <text x="81" y="20" textAnchor="middle" className="fill-outline-variant text-[10px] font-bold">
          R$
        </text>
      </g>

      <ellipse cx="80" cy="128" rx="46" ry="6" className="fill-surface-container-high" />

      {/* Legs */}
      <rect x="48" y="98" width="13" height="24" rx="6" className="fill-primary-fixed-dim" />
      <rect x="62" y="102" width="13" height="22" rx="6" className="fill-primary-fixed-dim" />
      <rect x="92" y="102" width="13" height="22" rx="6" className="fill-primary-fixed-dim" />
      <rect x="106" y="98" width="13" height="24" rx="6" className="fill-primary-fixed-dim" />

      {/* Tail */}
      <path
        d="M30 74c-9-1-10-13-1-12 6 1 4 8-1 7"
        className="fill-none stroke-primary-fixed-dim"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Body and ear */}
      <ellipse cx="80" cy="78" rx="52" ry="38" className="fill-primary-fixed" />
      <path d="M100 47 110 26 121 50Z" className="fill-primary-fixed-dim" strokeLinejoin="round" />

      {/* Coin slot */}
      <rect x="67" y="44" width="28" height="6" rx="3" className="fill-primary" />

      {/* Face */}
      <circle cx="112" cy="68" r="3.5" className="fill-on-surface" />
      <ellipse cx="104" cy="84" rx="6" ry="3.5" className="fill-tertiary-fixed" />
      <ellipse cx="135" cy="80" rx="11" ry="10" className="fill-primary-fixed-dim" />
      <circle cx="131.5" cy="80" r="2" className="fill-primary" />
      <circle cx="138.5" cy="80" r="2" className="fill-primary" />
    </svg>
  );
}

interface EmptyBudgetsProps {
  onCreate: () => void;
}

export function EmptyBudgets({ onCreate }: EmptyBudgetsProps) {
  return (
    <section className="flex flex-col items-center text-center rounded-3xl bg-surface-container-lowest px-6 py-8 shadow-[0_4px_20px_-2px_rgba(26,26,26,0.04)]">
      <EmptyPiggyBank />
      <h2 className="mt-4 text-headline-sm text-on-surface">Seu porquinho está vazio</h2>
      <p className="mt-2 text-body-md text-on-surface-variant max-w-xs">
        Crie metas por categoria e acompanhe quanto já gastou de cada uma no mês.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-6 h-12 px-6 rounded-xl bg-primary text-on-primary text-label-lg font-semibold shadow-md flex items-center gap-2 active:scale-95 transition-all"
      >
        <span className="material-symbols-outlined text-[20px]">add_circle</span>
        Criar primeira meta
      </button>
    </section>
  );
}
