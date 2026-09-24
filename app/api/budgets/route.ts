import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebase-admin";
import { isOwner } from "@/lib/pluggy";

const COLLECTION = "budgets";
const MAX_NAME_LENGTH = 60;

interface Budget {
  id: string;
  name: string;
  /** Monthly limit in BRL, the same every month */
  limit: number;
  /** Pluggy category names (in English, as the API returns them) */
  categories: string[];
}

function isCategoryList(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((category) => typeof category === "string" && category.length > 0)
  );
}

export async function GET(request: NextRequest) {
  const owner = request.nextUrl.searchParams.get("owner");
  if (!isOwner(owner)) {
    return NextResponse.json({ error: "owner inválido" }, { status: 400 });
  }

  try {
    const snapshot = await getDb().collection(COLLECTION).where("owner", "==", owner).get();
    const budgets = snapshot.docs
      .sort((a, b) => String(a.data().createdAt).localeCompare(String(b.data().createdAt)))
      .map((doc): Budget => {
        const data = doc.data();
        return { id: doc.id, name: data.name, limit: data.limit, categories: data.categories };
      });
    return NextResponse.json({ budgets });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const owner = body?.owner;
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const limit = body?.limit;
  const categories = body?.categories;

  if (!isOwner(owner)) {
    return NextResponse.json({ error: "owner inválido" }, { status: 400 });
  }
  if (!name || name.length > MAX_NAME_LENGTH) {
    return NextResponse.json({ error: "Nome inválido" }, { status: 400 });
  }
  if (typeof limit !== "number" || !Number.isFinite(limit) || limit <= 0) {
    return NextResponse.json({ error: "Limite inválido" }, { status: 400 });
  }
  if (!isCategoryList(categories)) {
    return NextResponse.json({ error: "Escolha ao menos uma categoria" }, { status: 400 });
  }

  try {
    const now = new Date().toISOString();
    const uniqueCategories = Array.from(new Set(categories));
    const ref = await getDb()
      .collection(COLLECTION)
      .add({ owner, name, limit, categories: uniqueCategories, createdAt: now, updatedAt: now });

    const budget: Budget = { id: ref.id, name, limit, categories: uniqueCategories };
    return NextResponse.json({ budget }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
