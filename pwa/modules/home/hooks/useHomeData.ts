"use client";

import { useEffect, useMemo, useState } from "react";

export type Owner = "gabriel" | "parceiro";

const RECENT_TRANSACTIONS_LIMIT = 8;

interface ReservedBalance {
  name: string | null;
  identification: string;
  availableAmounts: { amount: number; currencyCode: string }[];
}

interface BankData {
  hasReservedBalance: boolean | null;
  reservedBalances: ReservedBalance[] | null;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  type: "DEBIT" | "CREDIT";
  amount: number;
  category: string | null;
  status?: "PENDING" | "POSTED";
  paymentData?: { paymentMethod?: string | null } | null;
  creditCardMetadata?: { installmentNumber?: number; totalInstallments?: number } | null;
}

export interface Account {
  id: string;
  name: string;
  type: "BANK" | "CREDIT";
  balance: number;
  bankData: BankData | null;
  transactions: Transaction[];
}

export interface TransactionItem extends Transaction {
  accountName: string;
}

export interface TransactionGroup {
  label: string;
  items: TransactionItem[];
}

export interface AccountCard {
  id: string;
  label: string;
  amount: number;
  initials: string;
}

interface HomeData {
  accounts: Account[];
  totalBalance: number;
  monthlyNet: number;
  bankCards: AccountCard[];
  debtCards: AccountCard[];
  reserveCards: AccountCard[];
  transactionGroups: TransactionGroup[];
}

// Money moving between the user's own pockets, not real income or spending:
// savings box ("caixinha") transfers, and card bill payments (card purchases
// are already counted as spending, so the payment would count them twice).
const INTERNAL_MOVEMENT_CATEGORIES = new Set(["Transfer - Internal", "Credit card payment"]);

export function isInternalMovement(transaction: Pick<Transaction, "category">): boolean {
  return transaction.category !== null && INTERNAL_MOVEMENT_CATEGORIES.has(transaction.category);
}

interface CachedHome {
  accounts: Account[];
  nextAutoSyncAt: string | null;
}

// Module-level so it survives client-side navigation between home and detail.
const homeCache = new Map<Owner, CachedHome>();

export function getCachedTransaction(owner: Owner, transactionId: string) {
  for (const account of homeCache.get(owner)?.accounts ?? []) {
    const transaction = account.transactions.find((t) => t.id === transactionId);
    if (transaction) {
      return {
        transaction,
        account: { id: account.id, name: account.name, type: account.type },
      };
    }
  }
  return null;
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2);
  return (words[0][0] + words[1][0]).toUpperCase();
}

function groupLabelForDate(date: Date): string {
  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round(
    (startOfDay(now).getTime() - startOfDay(date).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Ontem";
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(date);
}

export function useHomeData(owner: Owner) {
  const [accounts, setAccounts] = useState<Account[] | null>(
    () => homeCache.get(owner)?.accounts ?? null
  );
  const [nextAutoSyncAt, setNextAutoSyncAt] = useState<string | null>(
    () => homeCache.get(owner)?.nextAutoSyncAt ?? null
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(() => !homeCache.has(owner));

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(!homeCache.has(owner));
      setError(null);
      try {
        const res = await fetch(`/api/pluggy/accounts?owner=${owner}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Falha ao buscar dados");
        if (!cancelled) {
          const next = data.nextAutoSyncAt ?? null;
          homeCache.set(owner, { accounts: data.accounts, nextAutoSyncAt: next });
          setAccounts(data.accounts);
          setNextAutoSyncAt(next);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erro desconhecido");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [owner]);

  const data: HomeData | null = useMemo(() => {
    if (!accounts) return null;

    const totalBalance = accounts
      .filter((account) => account.type === "BANK")
      .reduce((sum, account) => sum + account.balance, 0);

    const now = new Date();
    const monthlyNet = accounts
      .flatMap((account) => account.transactions)
      .filter((transaction) => {
        const date = new Date(transaction.date);
        return (
          !isInternalMovement(transaction) &&
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      })
      .reduce(
        (sum, transaction) =>
          sum + (transaction.type === "CREDIT" ? transaction.amount : -transaction.amount),
        0
      );

    const bankCards: AccountCard[] = accounts
      .filter((account) => account.type === "BANK")
      .map((account) => ({
        id: account.id,
        label: account.name,
        amount: account.balance,
        initials: getInitials(account.name),
      }));

    const debtCards: AccountCard[] = accounts
      .filter((account) => account.type === "CREDIT")
      .map((account) => ({
        id: account.id,
        label: `${account.name} · Cartão de crédito`,
        amount: account.balance,
        initials: getInitials(account.name),
      }));

    const reserveCards: AccountCard[] = accounts.flatMap((account) =>
      (account.bankData?.reservedBalances ?? []).map((reserved) => {
        const label = reserved.name ?? "Caixinha";
        return {
          id: reserved.identification,
          label,
          amount: reserved.availableAmounts.reduce((sum, a) => sum + a.amount, 0),
          initials: getInitials(label),
        };
      })
    );

    const flattenedTransactions = accounts
      .flatMap((account) =>
        account.transactions.map((transaction) => ({
          ...transaction,
          accountName: account.name,
        }))
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, RECENT_TRANSACTIONS_LIMIT);

    const groups = new Map<string, TransactionItem[]>();
    for (const transaction of flattenedTransactions) {
      const label = groupLabelForDate(new Date(transaction.date));
      const existing = groups.get(label);
      if (existing) {
        existing.push(transaction);
      } else {
        groups.set(label, [transaction]);
      }
    }

    const transactionGroups: TransactionGroup[] = Array.from(groups.entries()).map(
      ([label, items]) => ({ label, items })
    );

    return {
      accounts,
      totalBalance,
      monthlyNet,
      bankCards,
      debtCards,
      reserveCards,
      transactionGroups,
    };
  }, [accounts]);

  return { data, error, isLoading, nextAutoSyncAt };
}
