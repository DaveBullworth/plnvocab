import type { Entry } from "./Entry";

export interface VocabularyFile {
  version: number;
  updatedAt: string;
  entries: Entry[];
}

export const CURRENT_VOCABULARY_VERSION = 1;

export const EMPTY_VOCABULARY: VocabularyFile = {
  version: CURRENT_VOCABULARY_VERSION,
  updatedAt: new Date(0).toISOString(),
  entries: [],
};
