import { v4 as uuid } from "uuid";
import type { Entry } from "./Entry";
import {
  CURRENT_VOCABULARY_VERSION,
  type VocabularyFile,
} from "./Vocabulary";

export function createEntry(isWord: boolean): Entry {
  return { id: uuid(), pl: "", ru: "", isWord };
}

export function isFilledEntry(entry: Entry): boolean {
  return entry.pl.trim().length > 0 && entry.ru.trim().length > 0;
}

export interface DuplicatePolishGroup {
  normalized: string;
  values: string[];
}

export function findDuplicatePolish(entries: Entry[]): DuplicatePolishGroup[] {
  const groups = new Map<string, string[]>();
  for (const entry of entries) {
    const trimmed = entry.pl.trim();
    if (trimmed.length === 0) continue;
    const normalized = trimmed.toLowerCase();
    const list = groups.get(normalized);
    if (list) list.push(trimmed);
    else groups.set(normalized, [trimmed]);
  }
  const duplicates: DuplicatePolishGroup[] = [];
  for (const [normalized, values] of groups) {
    if (values.length > 1) duplicates.push({ normalized, values });
  }
  return duplicates;
}

export function serializeVocabularyFile(file: VocabularyFile): string {
  return JSON.stringify(file, null, 2);
}

export function parseVocabularyFile(raw: unknown): VocabularyFile {
  if (!raw || typeof raw !== "object") {
    throw new Error("Vocabulary file is not an object");
  }
  const obj = raw as Record<string, unknown>;
  if (!Array.isArray(obj.entries)) {
    throw new Error("Vocabulary file is missing 'entries' array");
  }
  const entries = obj.entries.map((e, i) => parseEntry(e, i));
  return {
    version:
      typeof obj.version === "number"
        ? obj.version
        : CURRENT_VOCABULARY_VERSION,
    updatedAt:
      typeof obj.updatedAt === "string"
        ? obj.updatedAt
        : new Date(0).toISOString(),
    entries,
  };
}

function parseEntry(raw: unknown, idx: number): Entry {
  if (!raw || typeof raw !== "object") {
    throw new Error(`Entry #${idx} is not an object`);
  }
  const e = raw as Record<string, unknown>;
  if (
    typeof e.id !== "string" ||
    typeof e.pl !== "string" ||
    typeof e.ru !== "string" ||
    typeof e.isWord !== "boolean"
  ) {
    throw new Error(`Entry #${idx} has invalid shape`);
  }
  return { id: e.id, pl: e.pl, ru: e.ru, isWord: e.isWord };
}
