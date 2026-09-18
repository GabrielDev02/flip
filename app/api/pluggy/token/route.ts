import { NextRequest, NextResponse } from "next/server";
import { getPluggyClient, isOwner } from "@/lib/pluggy";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const owner = body?.owner;

  if (!isOwner(owner)) {
    return NextResponse.json({ error: "owner inválido" }, { status: 400 });
  }

  try {
    const client = getPluggyClient(owner);
    const connectToken = await client.createConnectToken();
    return NextResponse.json(connectToken);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
