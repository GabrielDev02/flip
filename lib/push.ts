import "server-only";
import { createHash } from "node:crypto";
import webpush, { type PushSubscription } from "web-push";
import { getDb } from "@/lib/firebase-admin";
import type { Owner } from "@/lib/pluggy";

export interface PushPayload {
  title: string;
  body: string;
  /** Path opened when the notification is tapped */
  url?: string;
  /** Notifications with the same tag replace each other instead of stacking */
  tag?: string;
}

const COLLECTION = "pushSubscriptions";

let isConfigured = false;

function configure() {
  if (isConfigured) return;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) {
    throw new Error("Chaves VAPID não configuradas");
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  isConfigured = true;
}

// Endpoints are long URLs; hash them into a stable Firestore doc id.
function subscriptionId(endpoint: string): string {
  return createHash("sha256").update(endpoint).digest("hex");
}

export function isPushSubscription(value: unknown): value is PushSubscription {
  const sub = value as PushSubscription | null;
  return (
    typeof sub?.endpoint === "string" &&
    typeof sub.keys?.p256dh === "string" &&
    typeof sub.keys?.auth === "string"
  );
}

export async function saveSubscription(owner: Owner, subscription: PushSubscription) {
  await getDb()
    .collection(COLLECTION)
    .doc(subscriptionId(subscription.endpoint))
    .set({ owner, subscription, createdAt: new Date().toISOString() });
}

export async function deleteSubscription(endpoint: string) {
  await getDb().collection(COLLECTION).doc(subscriptionId(endpoint)).delete();
}

/** Sends to every device the owner subscribed; returns how many received it. */
export async function sendPushToOwner(owner: Owner, payload: PushPayload): Promise<number> {
  configure();
  const snapshot = await getDb().collection(COLLECTION).where("owner", "==", owner).get();
  const body = JSON.stringify(payload);

  const results = await Promise.all(
    snapshot.docs.map(async (doc) => {
      try {
        await webpush.sendNotification(doc.data().subscription as PushSubscription, body);
        return true;
      } catch (error) {
        // 404/410 mean the browser dropped the subscription; stop sending to it
        const statusCode = (error as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await doc.ref.delete();
        } else {
          console.error("Falha ao enviar push", statusCode, error);
        }
        return false;
      }
    })
  );

  return results.filter(Boolean).length;
}
