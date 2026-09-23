"use client";

import { useHomeData, type Owner } from "@/pwa/modules/home/hooks/useHomeData";
import { useBalanceHidden } from "@/pwa/modules/home/hooks/useBalanceHidden";
import { TopBar } from "@/pwa/modules/home/componentes/TopBar";
import { UserGreeting } from "@/pwa/modules/home/componentes/UserGreeting";
import { BalanceHeroCard } from "@/pwa/modules/home/componentes/BalanceHeroCard";
import { SyncStatus } from "@/pwa/modules/home/componentes/SyncStatus";
import { BankAccountsScroll } from "@/pwa/modules/home/componentes/BankAccountsScroll";
import { DebtsScroll } from "@/pwa/modules/home/componentes/DebtsScroll";
import { RecentTransactions } from "@/pwa/modules/home/componentes/RecentTransactions";
import { BottomNav } from "@/pwa/modules/home/componentes/BottomNav";
import { NotificationPrompt } from "@/pwa/modules/home/componentes/NotificationPrompt";
import { HomeSkeleton } from "@/pwa/modules/home/componentes/HomeSkeleton";

interface HomePageProps {
  owner: Owner;
  userName: string;
}

export function HomePage({ owner, userName }: HomePageProps) {
  const { data, error, isLoading, nextAutoSyncAt } = useHomeData(owner);
  const [isBalanceHidden, toggleBalanceHidden] = useBalanceHidden();

  return (
    <div className="font-pwa bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen flex flex-col">
      <TopBar owner={owner} />
      <main className="flex-1 flex flex-col relative w-full pt-16 pb-28 bg-surface px-margin">
        <div className="flex flex-col w-full space-y-5">
          <UserGreeting name={userName} />

          {isLoading && <HomeSkeleton />}

          {error && <p className="text-body-sm text-error">{error}</p>}

          {data && (
            <>
              <BalanceHeroCard
                balance={data.totalBalance}
                monthlyNet={data.monthlyNet}
                isHidden={isBalanceHidden}
                onToggleHidden={toggleBalanceHidden}
              />
              <SyncStatus nextAutoSyncAt={nextAutoSyncAt} />
              <BankAccountsScroll cards={data.bankCards} isHidden={isBalanceHidden} />
              <DebtsScroll cards={data.debtCards} isHidden={isBalanceHidden} />
              <RecentTransactions groups={data.transactionGroups} />
            </>
          )}
        </div>
      </main>
      <BottomNav />
      <NotificationPrompt owner={owner} />
    </div>
  );
}
