import { db } from "./db";
import { EXPORT_VERSION, type ExportPayload } from "./format";
import type { Entry } from "@/lib/domain/Entry";

export type ImportMode = "replace" | "merge";

export async function exportToJson(): Promise<string> {
  const entries = await db.entries.toArray();
  const payload: ExportPayload = {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    entries,
  };
  return JSON.stringify(payload, null, 2);
}

export function downloadJson(json: string): void {
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `plnvocab-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function importEntries(
  entries: Entry[],
  mode: ImportMode,
): Promise<void> {
  if (mode === "replace") {
    await db.transaction("rw", db.entries, async () => {
      await db.entries.clear();
      await db.entries.bulkAdd(entries);
    });
  } else {
    await db.entries.bulkPut(entries);
  }
}

const LEGACY_URL =
  "https://raw.githubusercontent.com/DaveBullworth/plnvocab/data/data/vocabulary.json";

interface LegacyEntry {
  id?: string;
  pl: string;
  ru: string;
  isWord: boolean;
}

function isLegacyEntry(value: unknown): value is LegacyEntry {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.pl === "string" &&
    typeof v.ru === "string" &&
    typeof v.isWord === "boolean" &&
    (v.id === undefined || typeof v.id === "string")
  );
}

export async function fetchLegacyEntries(): Promise<Entry[]> {
  const res = await fetch(LEGACY_URL, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch legacy data: ${res.status}`);
  }
  const raw: unknown = await res.json();
  let list: unknown[];
  if (Array.isArray(raw)) {
    list = raw;
  } else if (
    typeof raw === "object" &&
    raw !== null &&
    Array.isArray((raw as { entries?: unknown }).entries)
  ) {
    list = (raw as { entries: unknown[] }).entries;
  } else {
    throw new Error("Legacy file shape unrecognized.");
  }
  const now = Date.now();
  const out: Entry[] = [];
  for (const item of list) {
    if (isLegacyEntry(item)) {
      out.push({
        id: item.id ?? crypto.randomUUID(),
        origin: item.pl,
        ru: item.ru,
        isWord: item.isWord,
        lng: "pl",
        createdAt: now,
        updatedAt: now,
      });
    }
  }
  return out;
}
