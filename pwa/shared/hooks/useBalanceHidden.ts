"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "flip:balance-hidden";
const listeners = new Set<() => void>();
// Fallback so the toggle still works when storage is blocked (e.g. private mode)
let memoryHidden = false;

function readHidden(): boolean {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return stored === "1";
  } catch {
    // fall through to the in-memory value
  }
  return memoryHidden;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Keeps other open tabs of the PWA in sync too
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

/** Remembers the "eye" toggle across visits; the server always renders it visible. */
export function useBalanceHidden() {
  const isHidden = useSyncExternalStore(subscribe, readHidden, () => false);

  const toggle = useCallback(() => {
    memoryHidden = !readHidden();
    try {
      window.localStorage.setItem(STORAGE_KEY, memoryHidden ? "1" : "0");
    } catch {
      // storage unavailable; memoryHidden keeps it for this session
    }
    listeners.forEach((listener) => listener());
  }, []);

  return [isHidden, toggle] as const;
}
