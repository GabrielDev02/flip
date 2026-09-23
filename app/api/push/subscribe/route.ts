import { NextRequest, NextResponse } from "next/server";
import { isOwner, OWNER_NAMES } from "@/lib/pluggy";
import {
  deleteSubscription,
  isPushSubscription,
  saveSubscription,
  sendPushToOwner,
} from "@/lib/push";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const owner = body?.owner;
  const subscription = body?.subscription;

  if (!isOwner(owner) || !isPushSubscription(subscription)) {
    return NextResponse.json({ error: "owner ou inscrição inválida" }, { status: 400 });
  }

  try {
    await saveSubscription(owner, subscription);
    // Confirms end-to-end delivery right away
    await sendPushToOwner(owner, {
      title: OWNER_NAMES[owner]
        ? `Notificações ativadas, ${OWNER_NAMES[owner]} 🔔`
        : "Notificações ativadas 🔔",
      body: "Você vai ser avisado sempre que seus dados forem atualizados.",
      url: "/app/home",
      tag: "push-enabled",
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const endpoint = body?.endpoint;

  if (typeof endpoint !== "string" || endpoint.length === 0) {
    return NextResponse.json({ error: "endpoint inválido" }, { status: 400 });
  }

  try {
    await deleteSubscription(endpoint);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
