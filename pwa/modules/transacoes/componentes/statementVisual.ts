import type { Transaction } from "@/pwa/modules/home/hooks/useHomeData";

// Pluggy returns categories in English; these are the ones seen in our accounts.
const CATEGORY_LABELS: Record<string, string> = {
  "Proceeds interests and dividends": "Rendimentos",
  Transfers: "Transferência",
  Groceries: "Mercado",
  "Transfer - Internal": "Transferência interna",
  "Digital services": "Serviços digitais",
  Telecommunications: "Telefonia",
  Water: "Água",
  Electricity: "Energia",
  Services: "Serviços",
  "Public transportation": "Transporte público",
  "Transfer - PIX": "Transferência",
  "Taxi and ride-hailing": "Transporte",
  "Eating out": "Refeição",
  Clothing: "Vestuário",
  Internet: "Internet",
  Leisure: "Lazer",
  Education: "Educação",
  "Real estate financing": "Financiamento imobiliário",
  Utilities: "Contas da casa",
  Taxes: "Impostos",
  Shopping: "Compras",
  "Gas stations": "Combustível",
  Pharmacy: "Farmácia",
  Cashback: "Cashback",
  Housing: "Moradia",
  "Mutual funds": "Fundos de investimento",
  "Food delivery": "Delivery",
  Healthcare: "Saúde",
  "Pet supplies and vet": "Pet",
  "Same person transfer": "Mesma titularidade",
  Insurance: "Seguro",
  "Late payment and overdraft costs": "Juros e multas",
  Wellness: "Bem-estar",
  "Wellness and fitness": "Academia",
  "Credit card payment": "Pagamento de fatura",
  "Food and drinks": "Alimentação",
  Accomodation: "Hospedagem",
  "Cinema, theater and concerts": "Cinema e shows",
  Tickets: "Ingressos",
  "Transfer - Foreign Exchange": "Câmbio",
  Electronics: "Eletrônicos",
  Parking: "Estacionamento",
  Bookstore: "Livraria",
  "Tolls and in vehicle payment": "Pedágio",
  "Online bet": "Apostas",
  Donations: "Doações",
  "Sports goods": "Artigos esportivos",
  "Online shopping": "Compras online",
};

export function getCategoryLabel(category: string | null): string {
  if (!category) return "Sem categoria";
  return CATEGORY_LABELS[category] ?? category;
}

interface StatementVisual {
  icon: string;
  tone: string;
}

const VISUALS: { match: RegExp; icon: string; tone: string }[] = [
  { match: /eating out|food|restaur|ifood/i, icon: "restaurant", tone: "bg-tertiary-fixed text-on-tertiary-fixed-variant" },
  { match: /taxi|ride|uber|99|transportation/i, icon: "directions_car", tone: "bg-surface-variant text-on-surface-variant" },
  { match: /gas station|posto|parking|toll/i, icon: "local_gas_station", tone: "bg-surface-variant text-on-surface-variant" },
  { match: /interests|dividend|salár|salary|cashback/i, icon: "work", tone: "bg-secondary-container text-on-secondary-container" },
  { match: /transfer|pix/i, icon: "bolt", tone: "bg-secondary-container text-on-secondary-container" },
  { match: /grocer|mercado|supermerc/i, icon: "shopping_cart", tone: "bg-primary-fixed text-primary" },
  { match: /digital services|streaming|netflix|spotify|telecom|internet/i, icon: "subscriptions", tone: "bg-tertiary-fixed text-tertiary" },
  { match: /pharmacy|health|drogasil|wellness/i, icon: "local_pharmacy", tone: "bg-error-container text-on-error-container" },
  { match: /shopping|clothing|electronics|bookstore|sports/i, icon: "shopping_bag", tone: "bg-primary-fixed text-primary" },
  { match: /water|electricity|utilities|housing|real estate/i, icon: "home", tone: "bg-surface-variant text-on-surface-variant" },
  { match: /credit card payment/i, icon: "credit_card", tone: "bg-surface-variant text-on-surface-variant" },
];

export function getStatementVisual(transaction: Transaction): StatementVisual {
  const haystack = `${transaction.category ?? ""} ${transaction.description}`;
  const match = VISUALS.find((entry) => entry.match.test(haystack));
  if (match) return match;
  return transaction.type === "CREDIT"
    ? { icon: "call_received", tone: "bg-secondary-container text-on-secondary-container" }
    : { icon: "receipt_long", tone: "bg-surface-variant text-on-surface-variant" };
}

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
