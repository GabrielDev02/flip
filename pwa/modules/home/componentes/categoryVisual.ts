export interface CategoryVisual {
  icon: string;
  tone: string;
}

interface TransactionLike {
  category: string | null;
  description: string;
  type: "DEBIT" | "CREDIT";
}

const CATEGORY_ICONS: { match: RegExp; icon: string; tone: string }[] = [
  { match: /restaur|bar|food|refei/i, icon: "restaurant", tone: "bg-error-container text-error" },
  { match: /transport|uber|taxi|combust/i, icon: "directions_car", tone: "bg-surface-container-high text-on-surface" },
  { match: /pix|transfer/i, icon: "bolt", tone: "bg-secondary-container text-secondary" },
  { match: /market|mercado|supermerc|grocer/i, icon: "shopping_cart", tone: "bg-primary-fixed text-primary" },
  { match: /stream|netflix|assinatura|subscription/i, icon: "smart_display", tone: "bg-tertiary-fixed text-tertiary" },
  { match: /salário|salary|income|renda/i, icon: "payments", tone: "bg-secondary-container text-secondary" },
];

export function getCategoryVisual(transaction: TransactionLike): CategoryVisual {
  const haystack = `${transaction.category ?? ""} ${transaction.description}`;
  const match = CATEGORY_ICONS.find((entry) => entry.match.test(haystack));
  if (match) return match;
  return transaction.type === "CREDIT"
    ? { icon: "call_received", tone: "bg-secondary-container text-secondary" }
    : { icon: "receipt_long", tone: "bg-surface-container-high text-on-surface" };
}
