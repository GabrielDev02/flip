"use client";

import { useEffect, useMemo, useState } from "react";
import type { Owner } from "@/pwa/shared/types/owner";
import { daysAgo, getInitials } from "@/pwa/shared/utils/format";
import { isInternalMovement, signedAmount } from "@/pwa/shared/utils/transactions";

const RECENT_TRANSACTIONS_LIMIT = 8;

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
  transactionGroups: TransactionGroup[];
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

function groupLabelForDate(date: Date): string {
  const days = daysAgo(date);
  if (days === 0) return "Hoje";
  if (days === 1) return "Ontem";
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
      .reduce((sum, transaction) => sum + signedAmount(transaction), 0);

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
      transactionGroups,
    };
  }, [accounts]);

  return { data, error, isLoading, nextAutoSyncAt };
}
