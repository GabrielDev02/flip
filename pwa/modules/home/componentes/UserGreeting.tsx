interface UserGreetingProps {
  name: string;
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function UserGreeting({ name }: UserGreetingProps) {
  return (
    <section className="flex items-center justify-between pt-1">
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12 rounded-full overflow-hidden shadow-sm bg-primary flex items-center justify-center shrink-0">
          <span className="text-on-primary text-label-lg">{getInitials(name)}</span>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="text-headline-sm text-on-surface">Olá, {name}</span>
            <span className="text-base select-none">👋</span>
          </div>
          <span className="text-body-sm text-on-surface-variant">Bem-vindo de volta</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Notificações"
          className="relative w-11 h-11 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center text-on-surface hover:bg-surface-container-low active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-tertiary" />
        </button>
        <button
          type="button"
          aria-label="Ajustes"
          className="w-11 h-11 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center text-on-surface hover:bg-surface-container-low active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[22px]">tune</span>
        </button>
      </div>
    </section>
  );
}
