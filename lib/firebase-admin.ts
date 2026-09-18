import "server-only";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getServiceAccount() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!json) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT env var is not set");
  }
  return JSON.parse(json);
}

const app =
  getApps()[0] ??
  initializeApp({
    credential: cert(getServiceAccount()),
  });

export const db = getFirestore(app);
