export interface TransactionRow {
  id: string;
  date: string;
  description: string;
  type: "DEBIT" | "CREDIT";
  amount: number;
  category: string | null;
  accountName: string;
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

interface TransactionsTableProps {
  rows: TransactionRow[];
}

export function TransactionsTable({ rows }: TransactionsTableProps) {
  if (rows.length === 0) {
    return <p className="text-sm text-zinc-500">Nenhuma transação encontrada.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table className="w-full text-left text-sm">
        <thead className="bg-zinc-100 text-xs uppercase text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
          <tr>
            <th className="px-4 py-3">Data</th>
            <th className="px-4 py-3">Descrição</th>
            <th className="px-4 py-3">Conta</th>
            <th className="px-4 py-3">Categoria</th>
            <th className="px-4 py-3 text-right">Valor</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-t border-zinc-200 dark:border-zinc-800"
            >
              <td className="whitespace-nowrap px-4 py-3 text-zinc-600 dark:text-zinc-400">
                {dateFormatter.format(new Date(row.date))}
              </td>
              <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100">
                {row.description}
              </td>
              <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                {row.accountName}
              </td>
              <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                {row.category ?? "Sem categoria"}
              </td>
              <td
                className={`whitespace-nowrap px-4 py-3 text-right font-medium ${
                  row.type === "CREDIT" ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {row.type === "CREDIT" ? "+" : "-"}
                {currencyFormatter.format(Math.abs(row.amount))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
