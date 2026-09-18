import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebase-admin";

interface TransactionMeta {
  note: string;
  shared: boolean;
}

const DEFAULT_META: TransactionMeta = { note: "", shared: false };

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const doc = await getDb().collection("transactionMeta").doc(id).get();
    if (!doc.exists) {
      return NextResponse.json(DEFAULT_META);
    }

    const data = doc.data();
    return NextResponse.json({
      note: typeof data?.note === "string" ? data.note : "",
      shared: typeof data?.shared === "boolean" ? data.shared : false,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);

  const update: Partial<TransactionMeta> = {};
  if (typeof body?.note === "string") update.note = body.note;
  if (typeof body?.shared === "boolean") update.shared = body.shared;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nada para atualizar" }, { status: 400 });
  }

  try {
    await getDb()
      .collection("transactionMeta")
      .doc(id)
      .set({ ...update, updatedAt: new Date().toISOString() }, { merge: true });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
