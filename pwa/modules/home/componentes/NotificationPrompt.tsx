"use client";

import { useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import type { Owner } from "@/pwa/modules/home/hooks/useHomeData";
import { usePushNotifications } from "@/pwa/modules/home/hooks/usePushNotifications";

const SNOOZE_KEY = "flip:push-prompt-snoozed-until";
const SNOOZE_MS = 3 * 24 * 60 * 60 * 1000;

function isSnoozed(): boolean {
  try {
    return Number(window.localStorage.getItem(SNOOZE_KEY) ?? 0) > Date.now();
  } catch {
    return false;
  }
}

function snooze() {
  try {
    window.localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_MS));
  } catch {
    // storage unavailable; the prompt just shows again next visit
  }
}

interface NotificationPromptProps {
  owner: Owner;
}

/**
 * Asks for notifications as soon as the app opens. Browsers (iOS especially)
 * only allow the permission dialog after a tap, so this offers the button.
 */
export function NotificationPrompt({ owner }: NotificationPromptProps) {
  const { status, isBusy, enable } = usePushNotifications(owner);
  // Only read on the client; status is "loading" during SSR so nothing renders then
  const [isDismissed, setIsDismissed] = useState(() =>
    typeof window === "undefined" ? true : isSnoozed()
  );
  const [error, setError] = useState<string | null>(null);

  const mode = status === "off" ? "ask" : status === "needs-install" ? "install" : null;
  const isOpen = mode !== null && !isDismissed;

  function dismiss() {
    snooze();
    setIsDismissed(true);
  }

  async function handleEnable() {
    setError(null);
    try {
      const granted = await enable();
      if (granted) setIsDismissed(true);
      else dismiss();
    } catch {
      setError("Não foi possível ativar agora. Tente pelo sininho no topo.");
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.4 }}
              onClick={dismiss}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="notification-prompt-title"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 320, delay: 0.4 }}
              className="relative w-full max-w-md bg-surface-container-lowest rounded-t-3xl p-5 pb-safe shadow-2xl"
            >
              <div className="w-10 h-1 bg-surface-variant rounded-full mx-auto mb-5" />

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary-fixed text-primary flex items-center justify-center mb-4">
                  <span
                    className="material-symbols-outlined text-[32px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    notifications_active
                  </span>
                </div>
                <h2 id="notification-prompt-title" className="text-headline-md text-on-surface">
                  {mode === "install" ? "Instale o app para receber avisos" : "Ativar notificações?"}
                </h2>
                <p className="mt-2 text-body-md text-on-surface-variant">
                  {mode === "install"
                    ? "No iPhone, as notificações só funcionam com o app na tela de início."
                    : "A gente te avisa assim que seus dados forem atualizados com o banco."}
                </p>

                {mode === "install" && (
                  <ol className="mt-4 w-full space-y-2 text-left text-body-sm text-on-surface">
                    <li className="flex items-center gap-3 bg-surface-container-low rounded-xl p-3">
                      <span className="material-symbols-outlined text-[20px] text-primary">ios_share</span>
                      Toque em <strong>Compartilhar</strong> na barra do Safari
                    </li>
                    <li className="flex items-center gap-3 bg-surface-container-low rounded-xl p-3">
                      <span className="material-symbols-outlined text-[20px] text-primary">add_box</span>
                      Escolha <strong>Adicionar à Tela de Início</strong>
                    </li>
                    <li className="flex items-center gap-3 bg-surface-container-low rounded-xl p-3">
                      <span className="material-symbols-outlined text-[20px] text-primary">touch_app</span>
                      Abra o app pelo ícone e ative as notificações
                    </li>
                  </ol>
                )}

                {error && <p className="mt-3 text-body-sm text-error">{error}</p>}
              </div>

              <div className="flex items-center gap-3 pt-5">
                <button
                  type="button"
                  onClick={dismiss}
                  className="flex-1 h-12 rounded-xl bg-surface-container text-on-surface text-label-lg font-semibold active:scale-95 transition-all"
                >
                  {mode === "install" ? "Entendi" : "Agora não"}
                </button>
                {mode === "ask" && (
                  <button
                    type="button"
                    onClick={handleEnable}
                    disabled={isBusy}
                    className="flex-1 h-12 rounded-xl bg-primary text-on-primary text-label-lg font-semibold shadow-md active:scale-95 transition-all disabled:opacity-60"
                  >
                    {isBusy ? "Ativando..." : "Ativar notificações"}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
