"use client";

import { useEffect, useState } from "react";
import type { Owner } from "@/pwa/modules/home/hooks/useHomeData";
import { usePushNotifications, type PushStatus } from "@/pwa/modules/home/hooks/usePushNotifications";

const HINT_DURATION_MS = 3500;

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
  const { status, isBusy, enable, disable } = usePushNotifications(owner);
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    if (!hint) return;
    const timeout = setTimeout(() => setHint(null), HINT_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [hint]);

  async function handleClick() {
    switch (status) {
      case "needs-install":
        setHint("Adicione o app à tela de início (Compartilhar → Adicionar à Tela de Início) para receber notificações.");
        return;
      case "unsupported":
        setHint("Este navegador não suporta notificações.");
        return;
      case "denied":
        setHint("Notificações bloqueadas. Libere nas configurações do navegador.");
        return;
      case "on":
        await disable();
        setHint("Notificações desativadas.");
        return;
      case "off":
        try {
          const granted = await enable();
          setHint(granted ? "Notificações ativadas!" : "Permissão não concedida.");
        } catch {
          setHint("Não foi possível ativar as notificações.");
        }
        return;
    }
  }

  const isOn = status === "on";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        disabled={isBusy || status === "loading"}
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
