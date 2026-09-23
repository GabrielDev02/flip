import { after, NextRequest, NextResponse } from "next/server";
import { getOwnerByItemId, OWNER_NAMES } from "@/lib/pluggy";
import { sendPushToOwner } from "@/lib/push";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  const secret = process.env.PLUGGY_WEBHOOK_SECRET;
  if (!secret || request.headers.get("x-webhook-secret") !== secret) {
    return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  }

  const event = await request.json().catch(() => null);

  // item/updated fires once per finished sync (transactions/created fires per account)
  if (event?.event === "item/updated" && typeof event.itemId === "string") {
    const owner = getOwnerByItemId(event.itemId);
    if (owner) {
      // Pluggy expects a fast 2xx; push after responding
      const name = OWNER_NAMES[owner];
      after(async () => {
        try {
          await sendPushToOwner(owner, {
            title: "Dados Sincronizados ✅",
            body: name
              ? `${name}, suas transações já foram atualizadas. Toque para ver.`
              : "Suas transações já foram atualizadas. Toque para ver.",
            url: "/app/home",
            tag: "sync-done",
          });
        } catch (error) {
          console.error("Falha ao notificar sincronização", error);
        }
      });
    }
  }

  return NextResponse.json({ ok: true });
}
