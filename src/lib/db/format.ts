import type { Entry } from "@/lib/domain/Entry";
import { isLng } from "@/lib/domain/Lng";

export const EXPORT_VERSION = 2;

export interface ExportPayload {
  version: number;
  exportedAt: string;
  entries: Entry[];
}

export interface ParseResult {
  payload: ExportPayload;
  warnings: string[];
}

function isValidEntry(value: unknown): value is Entry {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.origin === "string" &&
    typeof v.ru === "string" &&
    typeof v.isWord === "boolean" &&
    isLng(v.lng) &&
    typeof v.createdAt === "number" &&
    typeof v.updatedAt === "number"
  );
}

export function parseExport(json: string): ParseResult {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    throw new Error("File is not valid JSON.");
  }
  if (typeof raw !== "object" || raw === null) {
    throw new Error("File root must be an object.");
  }
  const obj = raw as Record<string, unknown>;
  if (obj.version !== EXPORT_VERSION) {
    if (obj.version === 1) {
      throw new Error(
        "This looks like a v1 (MVP) export. Use the 'Import legacy data' button below to migrate.",
      );
    }
    throw new Error(
      `Unsupported version: ${String(obj.version)}. Expected ${EXPORT_VERSION}.`,
    );
  }
  if (!Array.isArray(obj.entries)) {
    throw new Error("`entries` must be an array.");
  }
  const warnings: string[] = [];
  const validEntries: Entry[] = [];
  obj.entries.forEach((e, i) => {
    if (isValidEntry(e)) {
      validEntries.push(e);
    } else {
      warnings.push(`Skipped entry #${i + 1}: invalid shape.`);
    }
  });
  return {
    payload: {
      version: EXPORT_VERSION,
      exportedAt:
        typeof obj.exportedAt === "string"
          ? obj.exportedAt
          : new Date().toISOString(),
      entries: validEntries,
    },
    warnings,
  };
}
