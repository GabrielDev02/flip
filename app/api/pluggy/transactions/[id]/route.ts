import { NextRequest, NextResponse } from "next/server";
import { getPluggyClient, isOwner } from "@/lib/pluggy";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const owner = request.nextUrl.searchParams.get("owner");

  if (!isOwner(owner)) {
    return NextResponse.json({ error: "owner inválido" }, { status: 400 });
  }

  try {
    const client = getPluggyClient(owner);
    const transaction = await client.fetchTransaction(id);
    const account = await client.fetchAccount(transaction.accountId);

    return NextResponse.json({
      transaction,
      account: { id: account.id, name: account.name, type: account.type },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
