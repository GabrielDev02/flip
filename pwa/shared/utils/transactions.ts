interface TransactionLike {
  type: "DEBIT" | "CREDIT";
  amount: number;
  category: string | null;
}

// Money moving between the user's own pockets, not real income or spending:
// savings box ("caixinha") transfers, and card bill payments (card purchases
// are already counted as spending, so the payment would count them twice).
const INTERNAL_MOVEMENT_CATEGORIES = new Set(["Transfer - Internal", "Credit card payment"]);

export function isInternalMovement(transaction: Pick<TransactionLike, "category">): boolean {
  return transaction.category !== null && INTERNAL_MOVEMENT_CATEGORIES.has(transaction.category);
}

/**
 * Positive for money in, negative for money out. Pluggy's own sign can't be
 * trusted for this: bank debits come negative but card purchases come positive.
 */
export function signedAmount(transaction: Pick<TransactionLike, "type" | "amount">): number {
  const amount = Math.abs(transaction.amount);
  return transaction.type === "CREDIT" ? amount : -amount;
}
