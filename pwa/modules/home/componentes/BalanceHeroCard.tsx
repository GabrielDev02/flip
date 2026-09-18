const numberFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

interface QuickAction {
  icon: string;
  label: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { icon: "send_money", label: "Transferir" },
  { icon: "qr_code_scanner", label: "Pagar" },
  { icon: "add_circle", label: "Adicionar" },
  { icon: "receipt_long", label: "Extrato" },
];

interface BalanceHeroCardProps {
  balance: number;
  monthlyNet: number;
  isHidden: boolean;
  onToggleHidden: () => void;
}

export function BalanceHeroCard({
  balance,
  monthlyNet,
  isHidden,
  onToggleHidden,
}: BalanceHeroCardProps) {
  const isPositive = monthlyNet >= 0;

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary-container to-on-primary-fixed-variant p-6 text-on-primary shadow-lg">
      <div className="pointer-events-none absolute -right-12 -top-12 w-48 h-48 rounded-full bg-surface-container-lowest/10 blur-2xl" />
      <div className="pointer-events-none absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-on-primary-fixed/20 blur-xl" />

      <div className="relative z-10 flex flex-col">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-label-md tracking-wider uppercase text-on-primary/80">
              Saldo total
            </span>
            <button
              type="button"
              onClick={onToggleHidden}
              aria-label={isHidden ? "Mostrar saldo" : "Ocultar saldo"}
              className="w-7 h-7 rounded-full bg-on-primary/10 hover:bg-on-primary/20 flex items-center justify-center text-on-primary transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">
                {isHidden ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
          <button
            type="button"
            aria-label="Detalhes de conta"
            className="w-8 h-8 rounded-full bg-on-primary/10 hover:bg-on-primary/20 flex items-center justify-center text-on-primary/90 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">more_horiz</span>
          </button>
        </div>

        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-headline-sm font-semibold text-on-primary/85">R$</span>
          <span className="text-display font-extrabold tracking-tight text-on-primary">
            {isHidden ? "••••••••" : numberFormatter.format(balance)}
          </span>
        </div>

        <div className="mt-3 flex items-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-on-primary/15 backdrop-blur-md text-on-primary">
            <span
              className={`material-symbols-outlined text-[16px] ${
                isPositive ? "text-secondary-fixed" : "text-on-primary"
              }`}
            >
              {isPositive ? "trending_up" : "trending_down"}
            </span>
            <span className="text-label-sm text-on-primary font-medium">
              {isPositive ? "+" : "-"}
              {currencyFormatter.format(Math.abs(monthlyNet))} este mês
            </span>
          </div>
        </div>

        <div className="mt-6 pt-5 grid grid-cols-4 gap-2 bg-on-primary/5 rounded-2xl p-2.5 backdrop-blur-sm">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              type="button"
              title="Em breve"
              className="group flex flex-col items-center justify-center py-1.5 hover:opacity-90 active:scale-95 transition-all"
            >
              <div className="w-11 h-11 rounded-full bg-surface-container-lowest/15 flex items-center justify-center group-hover:bg-surface-container-lowest/25 transition-all">
                <span className="material-symbols-outlined text-[20px] text-on-primary">
                  {action.icon}
                </span>
              </div>
              <span className="mt-1.5 text-label-sm text-on-primary/90">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
