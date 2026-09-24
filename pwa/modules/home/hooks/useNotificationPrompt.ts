"use client";

import { useState } from "react";
import type { Owner } from "@/pwa/shared/types/owner";
import { usePushNotifications } from "@/pwa/shared/hooks/usePushNotifications";
import { isPushPromptSnoozed, snoozePushPrompt } from "@/pwa/modules/home/utils/pushPromptSnooze";

type NotificationPromptMode = "ask" | "install";

export function useNotificationPrompt(owner: Owner) {
  const { status, isBusy, enable } = usePushNotifications(owner);
  // Only read on the client; status is "loading" during SSR so nothing renders then
  const [isDismissed, setIsDismissed] = useState(() =>
    typeof window === "undefined" ? true : isPushPromptSnoozed()
  );
  const [error, setError] = useState<string | null>(null);

  const mode: NotificationPromptMode | null =
    status === "off" ? "ask" : status === "needs-install" ? "install" : null;

  function dismiss() {
    snoozePushPrompt();
    setIsDismissed(true);
  }

  async function activate() {
    setError(null);
    try {
      const granted = await enable();
      if (granted) setIsDismissed(true);
      else dismiss();
    } catch (err) {
      // Surface the browser's reason; push failures are otherwise opaque on phones
      const detail = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
      console.error("Falha ao ativar notificações", err);
      setError(`Não foi possível ativar agora (${detail}).`);
    }
  }

  return {
    mode,
    isOpen: mode !== null && !isDismissed,
    isBusy,
    error,
    dismiss,
    activate,
  };
}
