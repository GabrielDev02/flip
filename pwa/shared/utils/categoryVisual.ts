interface TransactionLike {
  category: string | null;
  description: string;
  type: "DEBIT" | "CREDIT";
}

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

export interface CategoryVisual {
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

export function getCategoryVisual(transaction: TransactionLike): CategoryVisual {
  const haystack = `${transaction.category ?? ""} ${transaction.description}`;
  const match = VISUALS.find((entry) => entry.match.test(haystack));
  if (match) return match;
  return transaction.type === "CREDIT"
    ? { icon: "call_received", tone: "bg-secondary-container text-on-secondary-container" }
    : { icon: "receipt_long", tone: "bg-surface-variant text-on-surface-variant" };
}
