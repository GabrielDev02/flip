import type { Owner } from "@/pwa/shared/types/owner";
import { NotificationBell } from "@/pwa/shared/componentes/NotificationBell/NotificationBell";

interface TopBarProps {
  owner: Owner;
  title?: string;
}

export function TopBar({ owner, title = "Home" }: TopBarProps) {
  return (
    <header className="fixed top-0 w-full z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
      <div className="h-16 px-margin flex items-center justify-between">
        <div className="flex items-center gap-space-sm">
          <span className="text-headline-sm text-on-surface">{title}</span>
        </div>
        <div className="flex items-center gap-space-sm">
          <NotificationBell owner={owner} />
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary text-[18px]">
              person
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
