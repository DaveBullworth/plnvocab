import type { Entry } from "@/lib/domain/Entry";

const STORAGE_KEY = "vocabulary:draft";

const listeners = new Set<() => void>();

let cachedRaw: string | null = null;
let cachedSnapshot: Entry[] | null = null;

function readSnapshot(): Entry[] | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedSnapshot;
  cachedRaw = raw;
  if (!raw) {
    cachedSnapshot = null;
    return null;
  }
  try {
    const parsed = JSON.parse(raw);
    cachedSnapshot = Array.isArray(parsed) ? (parsed as Entry[]) : null;
  } catch {
    cachedSnapshot = null;
  }
  return cachedSnapshot;
}

function notify() {
  listeners.forEach((l) => l());
}

export function getDraft(): Entry[] | null {
  return readSnapshot();
}

export function setDraft(entries: Entry[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  notify();
}

export function clearDraft(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  notify();
}

export function subscribeDraft(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}
