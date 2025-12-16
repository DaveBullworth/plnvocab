import { createContext } from "react";
import type { VocabularyStorage } from "@/infrastructure/storage/VocabularyStorage";

/**
 * DI-контейнер для хранилища словаря
 *
 * Это просто "коробка", в которую кладётся реализация VocabularyStorage.
 */
export const StorageContext = createContext<VocabularyStorage | null>(null);
