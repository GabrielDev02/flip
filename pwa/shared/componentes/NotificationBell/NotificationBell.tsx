"use client";

import type { Owner } from "@/pwa/shared/types/owner";
import type { PushStatus } from "@/pwa/shared/hooks/usePushNotifications";
import { useNotificationBell } from "@/pwa/shared/hooks/useNotificationBell";

const ICONS: Record<PushStatus, string> = {
  loading: "notifications",
  unsupported: "notifications_off",
  "needs-install": "notifications",
  denied: "notifications_off",
  off: "notifications",
  on: "notifications_active",
};

interface NotificationBellProps {
  owner: Owner;
}

export function NotificationBell({ owner }: NotificationBellProps) {
  const { status, hint, toggle, isOn, isBusy, isDisabled } = useNotificationBell(owner);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggle}
        disabled={isDisabled}
        aria-label={isOn ? "Desativar notificações" : "Ativar notificações"}
        aria-pressed={isOn}
        className={`w-11 h-11 flex items-center justify-center transition-colors disabled:opacity-60 ${
          isOn ? "text-primary" : "text-on-surface-variant hover:text-on-surface"
        }`}
      >
        <span
          className={`material-symbols-outlined text-[22px] ${isBusy ? "animate-pulse" : ""}`}
          style={isOn ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
          {ICONS[status]}
        </span>
      </button>
      {hint && (
        <div
          role="status"
          className="absolute right-0 top-full mt-1 w-60 rounded-xl bg-inverse-surface text-inverse-on-surface text-body-sm p-3 shadow-lg"
        >
          {hint}
        </div>
      )}
    </div>
  );
}
