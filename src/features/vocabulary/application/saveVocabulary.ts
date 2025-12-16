import type { VocabularyStorage } from "@/infrastructure/storage/VocabularyStorage";
import type { Vocabulary } from "../domain/Vocabulary";

export function saveVocabulary(storage: VocabularyStorage) {
  return (vocabulary: Vocabulary) => storage.save(vocabulary);
}
