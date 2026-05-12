import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./db";
import type { Entry } from "@/lib/domain/Entry";
import type { Lng } from "@/lib/domain/Lng";

export function useEntries(lng: Lng, isWord: boolean): Entry[] | undefined {
  return useLiveQuery(
    async () => {
      const all = await db.entries.where("lng").equals(lng).toArray();
      return all
        .filter((e) => e.isWord === isWord)
        .sort((a, b) => b.updatedAt - a.updatedAt);
    },
    [lng, isWord],
  );
}

export async function addEntry(input: Omit<Entry, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const now = Date.now();
  const id = crypto.randomUUID();
  await db.entries.add({ ...input, id, createdAt: now, updatedAt: now });
  return id;
}

export async function updateEntry(id: string, patch: Partial<Omit<Entry, "id" | "createdAt">>): Promise<void> {
  await db.entries.update(id, { ...patch, updatedAt: Date.now() });
}

export async function deleteEntry(id: string): Promise<void> {
  await db.entries.delete(id);
}
