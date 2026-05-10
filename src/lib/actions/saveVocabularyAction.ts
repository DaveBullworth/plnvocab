"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import type { Entry } from "@/lib/domain/Entry";
import { isFilledEntry } from "@/lib/domain/vocabularyRules";
import { saveVocabulary } from "@/lib/storage/GitHubStorage";

export interface SaveVocabularyResult {
  ok: true;
  total: number;
  updatedAt: string;
}

export async function saveVocabularyAction(
  entries: Entry[],
): Promise<SaveVocabularyResult> {
  await requireAdmin();
  const cleaned = entries.filter(isFilledEntry);
  const file = await saveVocabulary(cleaned);

  updateTag("vocabulary");

  return { ok: true, total: cleaned.length, updatedAt: file.updatedAt };
}
