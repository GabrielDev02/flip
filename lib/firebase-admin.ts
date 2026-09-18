import "server-only";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

function getServiceAccount() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!json) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT env var is not set");
  }
  return JSON.parse(json);
}

let db: Firestore | null = null;

export function getDb(): Firestore {
  if (db) return db;

  const app =
    getApps()[0] ??
    initializeApp({
      credential: cert(getServiceAccount()),
    });

  db = getFirestore(app);
  return db;
}
