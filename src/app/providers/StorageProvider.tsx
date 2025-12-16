import type { ReactNode } from "react";
import { StorageContext } from "./StorageContext";
import { GitHubStorage } from "@/infrastructure/storage/GitHubStorage";

/**
 * StorageProvider
 *
 * Это composition root.
 * Единственное место в приложении, где:
 *  - создаётся конкретная реализация VocabularyStorage
 *  - решается "какое хранилище мы используем"
 */
export function StorageProvider({ children }: { children: ReactNode }) {
	/**
	 * Здесь мы СОЗДАЁМ конкретную реализацию.
	 *
	 * Всё, что ниже по дереву компонентов,
	 * не знает и не должно знать:
	 *  - что это GitHub
	 *  - что там токены
	 *  - что это REST / JSON
	 */
	const storage = new GitHubStorage(
		import.meta.env.VITE_GITHUB_REPO_URL,
		import.meta.env.VITE_GITHUB_TOKEN
	);

	/**
	 * Мы "кладём" storage в Context
	 *
	 * Теперь любой компонент / хук ниже
	 * может его получить, не создавая сам.
	 */
	return <StorageContext.Provider value={storage}>{children}</StorageContext.Provider>;
}
