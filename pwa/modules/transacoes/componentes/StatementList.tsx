import Link from "next/link";
import type { StatementEntry, StatementGroup } from "@/pwa/modules/transacoes/statementUtils";
import {
  getStatementBadge,
  getStatementVisual,
} from "@/pwa/modules/transacoes/componentes/statementVisual";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

function formatSigned(value: number) {
  return `${value >= 0 ? "+" : "-"} ${currencyFormatter.format(Math.abs(value))}`;
}

function StatementItem({ entry }: { entry: StatementEntry }) {
  const visual = getStatementVisual(entry);
  const badge = getStatementBadge(entry);
  const isCredit = entry.type === "CREDIT";
  const isPending = entry.status === "PENDING";

  return (
    <Link
      href={`/app/home/transacao/${entry.id}`}
      className="transaction-item bg-surface-container-lowest rounded-2xl p-3.5 flex items-center justify-between shadow-[0_2px_8px_rgba(26,26,26,0.02)] active:bg-surface-container transition-all cursor-pointer"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${visual.tone}`}
        >
          <span className="material-symbols-outlined text-[22px]">{visual.icon}</span>
        </div>
        <div className="min-w-0">
          {badge ? (
            <div className="flex items-center gap-1.5">
              <span className="text-label-lg text-on-surface font-semibold truncate">
                {entry.description}
              </span>
              <span className={`text-label-sm px-1.5 py-0.5 rounded shrink-0 ${badge.tone}`}>
                {badge.label}
              </span>
            </div>
          ) : (
            <span className="text-label-lg text-on-surface font-semibold truncate block">
              {entry.description}
            </span>
          )}
          <div className="flex items-center gap-1.5 text-on-surface-variant text-body-sm truncate">
            <span className="truncate">{entry.categoryLabel}</span>
            <span className="text-outline">•</span>
            <span className="truncate">{entry.account.sourceLabel}</span>
            <span className="text-outline">•</span>
            <span>{timeFormatter.format(new Date(entry.date))}</span>
          </div>
        </div>
      </div>
      <div className="text-right flex-shrink-0 pl-2">
        <span
          className={`text-label-lg font-bold block ${isCredit ? "text-secondary" : "text-tertiary"}`}
        >
          {isCredit ? "+ " : "- "}
          {currencyFormatter.format(Math.abs(entry.amount))}
        </span>
        <span
          className={`text-label-sm ${isCredit && !isPending ? "text-secondary" : "text-outline"}`}
        >
          {isPending ? "Pendente" : isCredit ? "Recebido" : "Concluído"}
        </span>
      </div>
    </Link>
  );
}

interface StatementListProps {
  groups: StatementGroup[];
}

export function StatementList({ groups }: StatementListProps) {
  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center text-center py-10 text-on-surface-variant">
        <span className="material-symbols-outlined text-[32px] text-outline">search_off</span>
        <span className="mt-2 text-body-sm">Nenhuma transação encontrada neste período.</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-1">
      {groups.map((group, index) => (
        <div key={group.key} className={`space-y-2 ${index > 0 ? "pt-2" : ""}`}>
          <div className="flex items-center justify-between px-1">
            <span className="text-label-lg text-on-surface font-bold">{group.label}</span>
            <span
              className={`text-label-md font-semibold ${
                group.net >= 0 ? "text-secondary" : "text-tertiary"
              }`}
            >
              {formatSigned(group.net)}
            </span>
          </div>
          {group.items.map((entry) => (
            <StatementItem key={entry.id} entry={entry} />
          ))}
        </div>
      ))}
    </div>
  );
}
