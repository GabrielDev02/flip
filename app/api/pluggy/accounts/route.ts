import { NextRequest, NextResponse } from "next/server";
import { getItemId, getPluggyClient, isOwner } from "@/lib/pluggy";

export async function GET(request: NextRequest) {
  const owner = request.nextUrl.searchParams.get("owner");

  if (!isOwner(owner)) {
    return NextResponse.json({ error: "owner inválido" }, { status: 400 });
  }

  try {
    const itemId = getItemId(owner);
    const client = getPluggyClient(owner);
    const { results: accounts } = await client.fetchAccounts(itemId);

    const accountsWithTransactions = await Promise.all(
      accounts.map(async (account) => {
        const transactions = await client.fetchAllTransactions(account.id);
        return { ...account, transactions };
      })
    );

    return NextResponse.json({ accounts: accountsWithTransactions });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
