"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const PluggyConnect = dynamic(
  () => import("react-pluggy-connect").then((mod) => mod.PluggyConnect),
  { ssr: false }
);

type Owner = "gabriel" | "parceiro";

interface PluggyItemResult {
  id: string;
  connector?: { name?: string };
}

interface ConnectAccountButtonProps {
  owner: Owner;
  label: string;
}

export function ConnectAccountButton({ owner, label }: ConnectAccountButtonProps) {
  const [connectToken, setConnectToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectedConnector, setConnectedConnector] = useState<string | null>(null);
  const [itemId, setItemId] = useState<string | null>(null);

  async function handleClick() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pluggy/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao gerar token de conexão");
      setConnectToken(data.accessToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  }

  function handleSuccess({ item }: { item: PluggyItemResult }) {
    setConnectToken(null);
    setConnectedConnector(item.connector?.name ?? "conta conectada");
    setItemId(item.id);
  }

  function handleError(err: { message?: string }) {
    setConnectToken(null);
    setError(err.message ?? "Falha na conexão com o banco");
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
      >
        {isLoading ? "Gerando conexão..." : label}
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {connectedConnector && (
        <p className="text-sm text-emerald-600">Conectado: {connectedConnector}</p>
      )}
      {itemId && (
        <p className="text-xs text-zinc-500">
          itemId: {itemId} (adicione em PLUGGY_ITEM_ID_{owner.toUpperCase()} no .env.local)
        </p>
      )}

      {connectToken && (
        <PluggyConnect
          connectToken={connectToken}
          onSuccess={handleSuccess}
          onError={handleError}
          onClose={() => setConnectToken(null)}
        />
      )}
    </div>
  );
}
