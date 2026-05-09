import type { Entry } from "@/lib/domain/Entry";

const KEY = "vocabulary:draft";

export const localDraftStorage = {
  load(): Entry[] | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return null;
      return parsed as Entry[];
    } catch {
      return null;
    }
  },

  save(entries: Entry[]): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(KEY, JSON.stringify(entries));
  },

  clear(): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(KEY);
  },
};
