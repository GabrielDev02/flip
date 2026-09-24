"use client";

import { useEffect, useState } from "react";
import type { Owner } from "@/pwa/shared/types/owner";
import { usePushNotifications } from "@/pwa/shared/hooks/usePushNotifications";

const HINT_DURATION_MS = 3500;

export function useNotificationBell(owner: Owner) {
  const { status, isBusy, enable, disable } = usePushNotifications(owner);
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    if (!hint) return;
    const timeout = setTimeout(() => setHint(null), HINT_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [hint]);

  async function toggle() {
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
        } catch (err) {
          const detail = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
          console.error("Falha ao ativar notificações", err);
          setHint(`Não foi possível ativar as notificações (${detail}).`);
        }
        return;
    }
  }

  return {
    status,
    hint,
    toggle,
    isOn: status === "on",
    isBusy,
    isDisabled: isBusy || status === "loading",
  };
}
