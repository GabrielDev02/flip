"use client";

import { useHomeData } from "@/pwa/modules/home/hooks/useHomeData";
import type { Owner } from "@/pwa/shared/types/owner";
import { useBalanceHidden } from "@/pwa/shared/hooks/useBalanceHidden";
import { TopBar } from "@/pwa/shared/componentes/TopBar/TopBar";
import { UserGreeting } from "@/pwa/modules/home/componentes/UserGreeting/UserGreeting";
import { BalanceHeroCard } from "@/pwa/modules/home/componentes/BalanceHeroCard/BalanceHeroCard";
import { SyncStatus } from "@/pwa/modules/home/componentes/SyncStatus/SyncStatus";
import { AccountsScroll } from "@/pwa/modules/home/componentes/AccountsScroll/AccountsScroll";
import { RecentTransactions } from "@/pwa/modules/home/componentes/RecentTransactions/RecentTransactions";
import { BottomNav } from "@/pwa/shared/componentes/BottomNav/BottomNav";
import { NotificationPrompt } from "@/pwa/modules/home/componentes/NotificationPrompt/NotificationPrompt";
import { HomeSkeleton } from "@/pwa/modules/home/componentes/HomeSkeleton/HomeSkeleton";

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
              <AccountsScroll
                title="Meus Bancos & Contas"
                variant="bank"
                cards={data.bankCards}
                isHidden={isBalanceHidden}
              />
              <AccountsScroll
                title="Minhas Dívidas"
                variant="debt"
                cards={data.debtCards}
                isHidden={isBalanceHidden}
                maxVisible={5}
              />
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
