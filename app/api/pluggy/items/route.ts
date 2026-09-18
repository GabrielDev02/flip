import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { isOwner } from "@/lib/pluggy";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const owner = body?.owner;
  const itemId = body?.itemId;
  const connectorName = body?.connectorName;

  if (!isOwner(owner) || typeof itemId !== "string" || itemId.length === 0) {
    return NextResponse.json({ error: "owner ou itemId inválido" }, { status: 400 });
  }

  await db
    .collection("pluggyItems")
    .doc(itemId)
    .set({
      owner,
      itemId,
      connectorName: typeof connectorName === "string" ? connectorName : null,
      createdAt: new Date().toISOString(),
    });

  return NextResponse.json({ ok: true });
}
