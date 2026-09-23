import "server-only";
import { PluggyClient } from "pluggy-sdk";

export type Owner = "gabriel" | "parceiro";

export const OWNERS: Owner[] = ["gabriel", "parceiro"];

// First names used to personalize notifications; null falls back to a generic message.
export const OWNER_NAMES: Record<Owner, string | null> = {
  gabriel: "Gabriel",
  parceiro: null,
};

export function isOwner(value: unknown): value is Owner {
  return typeof value === "string" && OWNERS.includes(value as Owner);
}

const clients = new Map<Owner, PluggyClient>();

export function getPluggyClient(owner: Owner): PluggyClient {
  const cached = clients.get(owner);
  if (cached) return cached;

  const clientId = process.env[`PLUGGY_CLIENT_ID_${owner.toUpperCase()}`];
  const clientSecret = process.env[`PLUGGY_CLIENT_SECRET_${owner.toUpperCase()}`];
  if (!clientId || !clientSecret) {
    throw new Error(`Credenciais Pluggy para "${owner}" não configuradas`);
  }

  const client = new PluggyClient({ clientId, clientSecret });
  clients.set(owner, client);
  return client;
}

export function getItemId(owner: Owner): string {
  const itemId = process.env[`PLUGGY_ITEM_ID_${owner.toUpperCase()}`];
  if (!itemId) {
    throw new Error(`itemId do Pluggy para "${owner}" não configurado`);
  }
  return itemId;
}

export function getOwnerByItemId(itemId: string): Owner | null {
  return (
    OWNERS.find((owner) => process.env[`PLUGGY_ITEM_ID_${owner.toUpperCase()}`] === itemId) ??
    null
  );
}
