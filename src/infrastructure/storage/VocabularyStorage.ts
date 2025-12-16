import type { Vocabulary } from "@/features/vocabulary/domain/Vocabulary";

export interface VocabularyStorage {
	load(): Promise<Vocabulary>;
	save(vocabulary: Vocabulary): Promise<void>;
}
