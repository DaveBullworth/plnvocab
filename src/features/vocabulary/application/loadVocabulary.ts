import type { VocabularyStorage } from "@/infrastructure/storage/VocabularyStorage";

export function loadVocabulary(storage: VocabularyStorage) {
  return () => storage.load();
}
