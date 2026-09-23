const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

function formatNextSync(value: string): string {
  const date = new Date(value);
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  if (date.getTime() <= now.getTime()) return "em breve";
  if (date.toDateString() === now.toDateString()) return `hoje às ${timeFormatter.format(date)}`;
  if (date.toDateString() === tomorrow.toDateString()) {
    return `amanhã às ${timeFormatter.format(date)}`;
  }
  return dateTimeFormatter.format(date);
}

interface SyncStatusProps {
  nextAutoSyncAt: string | null;
}

export function SyncStatus({ nextAutoSyncAt }: SyncStatusProps) {
  if (!nextAutoSyncAt) return null;

  return (
    <div className="flex items-center gap-1 px-1 text-label-sm text-on-surface-variant">
      <span className="material-symbols-outlined text-[16px]">schedule</span>
      Próxima atualização {formatNextSync(nextAutoSyncAt)}
    </div>
  );
}
