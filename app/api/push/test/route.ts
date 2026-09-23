// TEMPORARY: manual push test, triggered from the "Despesa compartilhada" toggle. Remove when done testing.
import { NextRequest, NextResponse } from "next/server";
import { isOwner, OWNER_NAMES } from "@/lib/pluggy";
import { sendPushToOwner } from "@/lib/push";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const owner = body?.owner;
  const description = typeof body?.description === "string" ? body.description : null;

  if (!isOwner(owner)) {
    return NextResponse.json({ error: "owner inválido" }, { status: 400 });
  }

  try {
    const name = OWNER_NAMES[owner];
    const delivered = await sendPushToOwner(owner, {
      title: "Teste de notificação 🧪",
      body: `${name ? `${name}, v` : "V"}ocê marcou ${
        description ? `"${description}"` : "uma transação"
      } como despesa compartilhada.`,
      url: "/app/home",
      tag: "push-test",
    });
    return NextResponse.json({ ok: true, delivered });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
