import type { Transaction } from "@/pwa/modules/home/hooks/useHomeData";

export interface StatementBadge {
  label: string;
  tone: string;
}

export function getStatementBadge(transaction: Transaction): StatementBadge | null {
  const installments = transaction.creditCardMetadata;
  if (installments?.totalInstallments) {
    return {
      label: `${installments.installmentNumber ?? 1}/${installments.totalInstallments}`,
      tone: "bg-surface-container text-on-surface-variant",
    };
  }
  switch (transaction.paymentData?.paymentMethod) {
    case "PIX":
      return { label: "Pix", tone: "bg-secondary-container/60 text-on-secondary-container font-medium" };
    case "TED":
    case "DOC":
      return {
        label: transaction.paymentData.paymentMethod,
        tone: "bg-secondary-fixed text-on-secondary-fixed font-medium",
      };
    case "BOLETO":
      return { label: "Boleto", tone: "bg-surface-container text-on-surface-variant" };
    default:
      return null;
  }
}

const BANK_DOTS: { match: RegExp; dot: string }[] = [
  { match: /nubank|nu\b/i, dot: "bg-purple-600" },
  { match: /itaú|itau/i, dot: "bg-orange-500" },
  { match: /inter/i, dot: "bg-amber-500" },
  { match: /mercado pago/i, dot: "bg-sky-500" },
  { match: /bradesco/i, dot: "bg-red-600" },
  { match: /santander/i, dot: "bg-red-500" },
  { match: /caixa/i, dot: "bg-blue-700" },
  { match: /c6/i, dot: "bg-neutral-800" },
];

export function getBankDot(name: string): string {
  return BANK_DOTS.find((entry) => entry.match.test(name))?.dot ?? "bg-primary";
}
