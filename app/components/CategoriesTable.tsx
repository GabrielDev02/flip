import type { TransactionRow } from "@/app/components/TransactionsTable";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

interface CategoryTotal {
  category: string;
  total: number;
  count: number;
}

interface CategoriesTableProps {
  rows: TransactionRow[];
}

export function CategoriesTable({ rows }: CategoriesTableProps) {
  const expenses = rows.filter((row) => row.type === "DEBIT");

  if (expenses.length === 0) {
    return <p className="text-sm text-zinc-500">Nenhum gasto encontrado.</p>;
  }

  const totalsByCategory = new Map<string, CategoryTotal>();
  for (const row of expenses) {
    const category = row.category ?? "Sem categoria";
    const existing = totalsByCategory.get(category);
    const amount = Math.abs(row.amount);
    if (existing) {
      existing.total += amount;
      existing.count += 1;
    } else {
      totalsByCategory.set(category, { category, total: amount, count: 1 });
    }
  }

  const categories = Array.from(totalsByCategory.values()).sort(
    (a, b) => b.total - a.total
  );
  const grandTotal = categories.reduce((sum, category) => sum + category.total, 0);

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table className="w-full text-left text-sm">
        <thead className="bg-zinc-100 text-xs uppercase text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
          <tr>
            <th className="px-4 py-3">Categoria</th>
            <th className="px-4 py-3 text-right">Transações</th>
            <th className="px-4 py-3 text-right">Total gasto</th>
            <th className="px-4 py-3 text-right">% do total</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr
              key={category.category}
              className="border-t border-zinc-200 dark:border-zinc-800"
            >
              <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100">
                {category.category}
              </td>
              <td className="px-4 py-3 text-right text-zinc-600 dark:text-zinc-400">
                {category.count}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-red-600">
                {currencyFormatter.format(category.total)}
              </td>
              <td className="px-4 py-3 text-right text-zinc-600 dark:text-zinc-400">
                {((category.total / grandTotal) * 100).toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
