"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCategoryVisual } from "@/pwa/modules/home/componentes/categoryVisual";
import { TransactionDetailSkeleton } from "@/pwa/modules/home/componentes/TransactionDetailSkeleton";
import { getCachedTransaction, type Owner } from "@/pwa/modules/home/hooks/useHomeData";

interface CreditCardMetadata {
  installmentNumber?: number;
  totalInstallments?: number;
  cardNumber?: string;
}

interface PaymentData {
  referenceNumber?: string;
}

interface TransactionDetail {
  id: string;
  date: string;
  description: string;
  type: "DEBIT" | "CREDIT";
  amount: number;
  category: string | null;
  status?: "PENDING" | "POSTED";
  creditCardMetadata: CreditCardMetadata | null;
  paymentData?: PaymentData;
}

interface AccountSummary {
  id: string;
  name: string;
  type: "BANK" | "CREDIT";
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

function getPaymentMethodLabel(transaction: TransactionDetail) {
  if (transaction.creditCardMetadata) {
    const { installmentNumber, totalInstallments, cardNumber } =
      transaction.creditCardMetadata;
    const label =
      totalInstallments && totalInstallments > 1
        ? `Crédito • Parcela ${installmentNumber}/${totalInstallments}`
        : "Crédito à vista";
    return {
      label,
      detail: cardNumber ? `Final •• ${cardNumber.slice(-4)}` : undefined,
    };
  }
  if (transaction.paymentData?.referenceNumber) {
    return { label: transaction.paymentData.referenceNumber, detail: undefined };
  }
  return {
    label: transaction.type === "CREDIT" ? "Entrada" : "Débito em conta",
    detail: undefined,
  };
}

interface TransactionDetailPageProps {
  transactionId: string;
  owner: Owner;
}

export function TransactionDetailPage({ transactionId, owner }: TransactionDetailPageProps) {
  const router = useRouter();
  // The home list already holds the full Pluggy transaction, so reuse it when available.
  const [cached] = useState(() => getCachedTransaction(owner, transactionId));
  const [transaction, setTransaction] = useState<TransactionDetail | null>(
    () => (cached?.transaction as TransactionDetail | undefined) ?? null
  );
  const [account, setAccount] = useState<AccountSummary | null>(
    () => cached?.account ?? null
  );
  const [note, setNote] = useState("");
  const [shared, setShared] = useState(false);
  const [isMetaLoaded, setIsMetaLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!cached);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadTransaction() {
      try {
        const res = await fetch(`/api/pluggy/transactions/${transactionId}?owner=${owner}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Falha ao buscar transação");
        if (!cancelled) {
          setTransaction(data.transaction);
          setAccount(data.account);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erro desconhecido");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    async function loadMeta() {
      try {
        const res = await fetch(`/api/transaction-meta/${transactionId}`);
        const data = await res.json();
        if (!cancelled && res.ok) {
          setNote(data.note ?? "");
          setShared(data.shared ?? false);
        }
      } catch {
        // meta is optional; keep defaults
      } finally {
        if (!cancelled) setIsMetaLoaded(true);
      }
    }

    if (!cached) loadTransaction();
    loadMeta();
    return () => {
      cancelled = true;
    };
  }, [transactionId, owner, cached]);

  async function saveMeta(update: { note?: string; shared?: boolean }) {
    await fetch(`/api/transaction-meta/${transactionId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(update),
    });
  }

  function handleToggleShared() {
    const next = !shared;
    setShared(next);
    saveMeta({ shared: next });

    // TEMPORARY: push test, remove together with app/api/push/test
    if (next) {
      fetch("/api/push/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner, description: transaction?.description }),
      }).catch(() => {});
    }
  }

  function handleNoteBlur() {
    saveMeta({ note });
  }

  async function handleCopyId() {
    if (!transaction) return;
    try {
      await navigator.clipboard.writeText(transaction.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable, ignore
    }
  }

  async function handleShare() {
    if (!transaction || !navigator.share) return;
    await navigator.share({
      title: transaction.description,
      text: `${transaction.description} — ${currencyFormatter.format(Math.abs(transaction.amount))}`,
    });
  }

  if (isLoading) {
    return <TransactionDetailSkeleton />;
  }

  return (
    <div className="font-pwa bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen flex flex-col">
      <nav className="w-full px-5 py-3 flex items-center justify-between sticky top-0 bg-surface/90 backdrop-blur-md z-30">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Voltar"
          className="w-10 h-10 rounded-full bg-surface-container-lowest border border-surface-container-high flex items-center justify-center shadow-sm active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <h1 className="text-label-lg font-bold text-on-surface">Detalhes da transação</h1>
        <div className="w-10 h-10" />
      </nav>

      <main className="flex-1 px-5 pb-10 flex flex-col gap-5">
        {error && <p className="text-body-sm text-error">{error}</p>}

        {transaction && (
          <>
            {(() => {
              const visual = getCategoryVisual(transaction);
              const payment = getPaymentMethodLabel(transaction);
              const isCredit = transaction.type === "CREDIT";

              return (
                <>
                  <section className="flex flex-col items-center text-center pt-3">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center mb-3.5 shadow-sm ${visual.tone}`}
                    >
                      <span className="material-symbols-outlined text-[32px]">
                        {visual.icon}
                      </span>
                    </div>
                    <h2 className="text-headline-sm text-on-surface">
                      {transaction.description}
                    </h2>
                    <span
                      className={`mt-1 text-headline-lg font-extrabold ${
                        isCredit ? "text-secondary" : "text-error"
                      }`}
                    >
                      {isCredit ? "+ " : "- "}
                      {currencyFormatter.format(Math.abs(transaction.amount))}
                    </span>
                    <p className="text-body-sm text-on-surface-variant mt-1.5">
                      {dateTimeFormatter.format(new Date(transaction.date))} ·{" "}
                      {payment.label}
                    </p>
                    <div className="mt-3 inline-flex items-center gap-1.5 bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-label-sm font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                      <span>
                        {transaction.status === "PENDING" ? "Pendente" : "Concluída"}
                      </span>
                    </div>
                  </section>

                  <section className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm divide-y divide-surface-container-high text-body-sm">
                    <div className="py-3 flex items-center justify-between first:pt-1">
                      <span className="text-on-surface-variant font-medium">Categoria</span>
                      <span className="font-semibold text-on-surface">
                        {transaction.category ?? "Sem categoria"}
                      </span>
                    </div>
                    <div className="py-3 flex items-center justify-between">
                      <span className="text-on-surface-variant font-medium">
                        Conta / Banco
                      </span>
                      <span className="font-semibold text-on-surface">
                        {account?.name ?? "—"}
                      </span>
                    </div>
                    <div className="py-3 flex items-center justify-between">
                      <span className="text-on-surface-variant font-medium">
                        Forma de pagamento
                      </span>
                      <div className="text-right">
                        <span className="font-semibold text-on-surface block">
                          {payment.label}
                        </span>
                        {payment.detail && (
                          <span className="text-label-sm text-on-surface-variant">
                            {payment.detail}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="py-3 flex items-center justify-between last:pb-1">
                      <span className="text-on-surface-variant font-medium">
                        ID da transação
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyId}
                        className="inline-flex items-center gap-1.5 text-label-sm text-on-surface bg-surface-container-low hover:bg-surface-container px-2 py-1 rounded-md transition-colors font-mono"
                      >
                        <span>#{transaction.id.slice(0, 8)}</span>
                        <span className="material-symbols-outlined text-[16px]">
                          {copied ? "check" : "content_copy"}
                        </span>
                      </button>
                    </div>
                  </section>
                </>
              );
            })()}

            <section className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary-fixed text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">group</span>
                  </div>
                  <div>
                    <h4 className="text-label-lg font-bold text-on-surface">
                      Despesa compartilhada
                    </h4>
                    <p className="text-label-sm text-on-surface-variant mt-0.5">
                      Dividir igualmente com o Parceiro
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={shared}
                  onClick={handleToggleShared}
                  disabled={!isMetaLoaded}
                  className={`relative w-11 h-6 rounded-full transition-colors shrink-0 disabled:opacity-50 ${
                    shared ? "bg-primary" : "bg-surface-container-high"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-surface-container-lowest transition-transform ${
                      shared ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </div>

              {shared && transaction && (
                <div className="mt-3.5 pt-3 border-t border-surface-container-high flex items-center justify-between text-label-sm">
                  <span className="text-on-surface-variant font-medium">
                    Divisão 50% / 50%
                  </span>
                  <span className="font-bold text-on-surface">
                    Sua parte:{" "}
                    <strong className="text-primary">
                      {currencyFormatter.format(Math.abs(transaction.amount) / 2)}
                    </strong>
                  </span>
                </div>
              )}
            </section>

            <section className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="transaction-note"
                  className="text-label-sm font-bold text-on-surface"
                >
                  Notas
                </label>
                <span className="text-label-sm uppercase text-on-surface-variant">
                  Opcional
                </span>
              </div>
              <textarea
                id="transaction-note"
                rows={2}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                onBlur={handleNoteBlur}
                disabled={!isMetaLoaded}
                placeholder={
                  isMetaLoaded ? "Ex: Almoço com cliente na sexta-feira..." : "Carregando..."
                }
                className="w-full disabled:opacity-60 text-body-sm text-on-surface placeholder-on-surface-variant bg-surface-container-low border border-surface-container-high rounded-xl p-3 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary outline-none resize-none"
              />
              <button
                type="button"
                title="Em breve"
                disabled
                className="w-full py-2.5 px-3 border border-dashed border-surface-container-high rounded-xl flex items-center justify-center gap-2 text-label-sm font-semibold text-on-surface-variant opacity-60"
              >
                <span className="material-symbols-outlined text-[18px]">attach_file</span>
                <span>Anexar comprovante (em breve)</span>
              </button>
            </section>

            <footer className="pt-2 text-center space-y-4">
              <div className="inline-flex items-center gap-1.5 text-label-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px] text-secondary">
                  verified
                </span>
                <span>
                  Sincronizado automaticamente via <strong>Open Finance Brasil</strong>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  title="Em breve"
                  className="w-full py-3 px-3 bg-surface-container-lowest border border-surface-container-high rounded-xl text-label-sm font-semibold text-on-surface-variant flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">flag</span>
                  <span>Reportar problema</span>
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="w-full py-3 px-3 bg-primary text-on-primary rounded-xl text-label-sm font-bold flex items-center justify-center gap-1.5 shadow-sm hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">share</span>
                  <span>Compartilhar</span>
                </button>
              </div>
            </footer>
          </>
        )}
      </main>
    </div>
  );
}
