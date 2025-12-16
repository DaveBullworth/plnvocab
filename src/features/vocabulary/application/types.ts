import type { Vocabulary } from "../domain/Vocabulary";

export type LoadVocabulary = () => Promise<Vocabulary>;
export type SaveVocabulary = (vocabulary: Vocabulary) => Promise<void>;
