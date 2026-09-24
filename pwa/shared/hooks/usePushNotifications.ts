"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import type { Owner } from "@/pwa/shared/types/owner";

export type PushStatus =
  | "loading"
  | "unsupported"
  /** iOS only delivers web push to apps added to the home screen */
  | "needs-install"
  | "denied"
  | "off"
  | "on";

interface PushState {
  status: PushStatus;
  isBusy: boolean;
}

// Module-level store so the bell and the first-open prompt stay in sync.
let state: PushState = { status: "loading", isBusy: false };
const SERVER_STATE: PushState = { status: "loading", isBusy: false };
const listeners = new Set<() => void>();
let initPromise: Promise<PushSubscription | null> | null = null;
let hasResynced = false;

function setState(patch: Partial<PushState>) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from(raw, (char) => char.charCodeAt(0));
}

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches;
}

async function init(): Promise<PushSubscription | null> {
  const supported = "serviceWorker" in navigator && "PushManager" in window;
  if (!supported) {
    setState({ status: isIOS() && !isStandalone() ? "needs-install" : "unsupported" });
    return null;
  }
  const registration = await navigator.serviceWorker.register("/sw.js", {
    scope: "/",
    updateViaCache: "none",
  });
  const subscription = await registration.pushManager.getSubscription();
  if (Notification.permission === "denied") setState({ status: "denied" });
  else setState({ status: subscription ? "on" : "off" });
  return subscription;
}

function postSubscription(owner: Owner, subscription: PushSubscription, silent: boolean) {
  return fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ owner, subscription: subscription.toJSON(), silent }),
  });
}

export function usePushNotifications(owner: Owner) {
  const { status, isBusy } = useSyncExternalStore(
    subscribe,
    () => state,
    () => SERVER_STATE
  );

  useEffect(() => {
    initPromise ??= init().catch(() => {
      setState({ status: "unsupported" });
      return null;
    });
    // The browser may hold a subscription the server never stored (e.g. a failed
    // first save), which would look "on" but never receive pushes. Re-send it once.
    initPromise.then((subscription) => {
      if (!subscription || hasResynced) return;
      hasResynced = true;
      postSubscription(owner, subscription, true).catch(() => {});
    });
  }, [owner]);

  const enable = useCallback(async () => {
    setState({ isBusy: true });
    try {
      // Must run inside the tap handler: iOS only prompts from a user gesture
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState({ status: permission === "denied" ? "denied" : "off" });
        return false;
      }
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
      });
      const res = await postSubscription(owner, subscription, false);
      if (!res.ok) {
        await subscription.unsubscribe();
        const data = await res.json().catch(() => null);
        throw new Error(`servidor ${res.status}: ${data?.error ?? "falha ao registrar"}`);
      }
      setState({ status: "on" });
      return true;
    } finally {
      setState({ isBusy: false });
    }
  }, [owner]);

  const disable = useCallback(async () => {
    setState({ isBusy: true });
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }
      setState({ status: "off" });
    } finally {
      setState({ isBusy: false });
    }
  }, []);

  return { status, isBusy, enable, disable };
}
