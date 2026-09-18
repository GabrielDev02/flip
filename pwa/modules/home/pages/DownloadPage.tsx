"use client";

import Link from "next/link";
import { useInstallPrompt } from "@/pwa/modules/home/hooks/useInstallPrompt";

export function DownloadPage() {
  const { canInstall, isIOS, promptInstall } = useInstallPrompt();

  return (
    <div className="font-pwa bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen flex flex-col items-center justify-center px-margin text-center gap-6">
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary via-primary-container to-on-primary-fixed-variant flex items-center justify-center shadow-lg">
        <span className="text-on-primary text-headline-lg font-extrabold">R$</span>
      </div>

      <div className="flex flex-col gap-2 max-w-sm">
        <h1 className="text-headline-lg text-on-surface">Controle de Gastos do Casal</h1>
        <p className="text-body-md text-on-surface-variant">
          Acompanhe saldo, dívidas e transações das suas contas do Open Finance direto
          do celular.
        </p>
      </div>

      {isIOS ? (
        <p className="text-body-sm text-on-surface-variant max-w-xs">
          Toque em compartilhar e depois em &quot;Adicionar à Tela de Início&quot; pra
          instalar.
        </p>
      ) : canInstall ? (
        <button
          type="button"
          onClick={promptInstall}
          className="rounded-full bg-primary text-on-primary px-8 py-3 text-label-lg font-semibold hover:opacity-90 active:scale-95 transition-all"
        >
          Baixar app
        </button>
      ) : (
        <p className="text-body-sm text-on-surface-variant max-w-xs">
          Abra este link pelo Chrome no Android pra instalar o app.
        </p>
      )}

      <Link
        href="/app/home"
        className="text-label-lg font-semibold text-primary hover:underline"
      >
        Abrir no navegador
      </Link>
    </div>
  );
}
