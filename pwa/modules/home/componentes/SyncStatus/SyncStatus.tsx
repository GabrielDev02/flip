import { formatNextSync } from "@/pwa/modules/home/utils/syncStatus";

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
