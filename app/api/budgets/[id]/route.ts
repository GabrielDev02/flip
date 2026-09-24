import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebase-admin";
import { isOwner, type Owner } from "@/lib/pluggy";

const COLLECTION = "budgets";

/** Loads the budget and checks it belongs to `owner`, so one person can't touch the other's metas */
async function findOwnedBudget(id: string, owner: Owner) {
  const ref = getDb().collection(COLLECTION).doc(id);
  const doc = await ref.get();
  return doc.exists && doc.data()?.owner === owner ? ref : null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const owner = body?.owner;
  const limit = body?.limit;

  if (!isOwner(owner)) {
    return NextResponse.json({ error: "owner inválido" }, { status: 400 });
  }
  if (typeof limit !== "number" || !Number.isFinite(limit) || limit <= 0) {
    return NextResponse.json({ error: "Limite inválido" }, { status: 400 });
  }

  try {
    const ref = await findOwnedBudget(id, owner);
    if (!ref) return NextResponse.json({ error: "Meta não encontrada" }, { status: 404 });

    await ref.update({ limit, updatedAt: new Date().toISOString() });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const owner = request.nextUrl.searchParams.get("owner");

  if (!isOwner(owner)) {
    return NextResponse.json({ error: "owner inválido" }, { status: 400 });
  }

  try {
    const ref = await findOwnedBudget(id, owner);
    if (!ref) return NextResponse.json({ error: "Meta não encontrada" }, { status: 404 });

    await ref.delete();
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
