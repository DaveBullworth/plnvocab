"use server";

import { revalidatePath } from "next/cache";
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
  const cleaned = entries.filter(isFilledEntry);
  const file = await saveVocabulary(cleaned);

  revalidatePath("/words");
  revalidatePath("/phrases");

  return { ok: true, total: cleaned.length, updatedAt: file.updatedAt };
}
