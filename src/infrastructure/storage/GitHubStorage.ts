import type { VocabularyStorage } from "./VocabularyStorage";
import type { Vocabulary } from "@/features/vocabulary/domain/Vocabulary";

/**
 * GitHubStorage — постоянное хранилище словаря через GitHub JSON.
 * Реализует интерфейс VocabularyStorage
 */
export class GitHubStorage implements VocabularyStorage {
	private repoUrl: string;
	private repoToken: string;
	// URL репозитория и токен GitHub
	constructor(repoUrl: string, repoToken: string) {
		this.repoUrl = repoUrl;
		this.repoToken = repoToken;
	}

	/**
	 * Загружает словарь с GitHub
	 */
	async load(): Promise<Vocabulary> {
		// здесь будет fetch к GitHub API, например:
		// GET /repos/:owner/:repo/contents/data/vocabulary.json
		// нужно указать token в headers
		// затем JSON.parse(response)

		// пока заглушка для каркаса
		return {
			version: 1,
			updatedAt: new Date().toISOString(),
			entries: []
		};
	}

	/**
	 * Сохраняет словарь на GitHub
	 */
	async save(vocabulary: Vocabulary): Promise<void> {
		// Временная заглушка
		console.info(vocabulary);
		// здесь будет PUT /repos/:owner/:repo/contents/data/vocabulary.json
		// с Base64 закодированным content и commit message
		// после успешного ответа функция завершится
	}
}
