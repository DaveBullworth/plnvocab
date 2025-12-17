import type { VocabularyStorage } from "./VocabularyStorage";
import type { Vocabulary } from "@/features/vocabulary/domain/Vocabulary";

/**
 * GitHubStorage — постоянное хранилище словаря через GitHub JSON.
 * Реализует интерфейс VocabularyStorage
 */
export class GitHubStorage implements VocabularyStorage {
	private repoUrl: string;
	private repoToken: string;
	private path = "data/vocabulary.json"; // путь к файлу в репозитории
	private branch = "data"; // ветка репозитория, где хранится JSON

	constructor(repoUrl: string, repoToken: string) {
		this.repoUrl = repoUrl;
		this.repoToken = repoToken;
	}

	/**
	 * Загружает JSON-файл словаря с GitHub
	 */
	async load(): Promise<Vocabulary> {
		const url = `${this.repoUrl}/contents/${this.path}?ref=${this.branch}`;

		const res = await fetch(url, {
			headers: {
				Authorization: `token ${this.repoToken}`,
				Accept: "application/vnd.github+json"
			}
		});

		if (!res.ok) {
			throw new Error(`GitHub load failed: ${res.statusText}`);
		}

		const data = await res.json();

		// GitHub возвращает содержимое файла в Base64
		const contentBase64 = data.content;
		const contentJson = atob(contentBase64); // декодируем Base64
		const vocabulary: Vocabulary = JSON.parse(contentJson);

		return vocabulary;
	}

	/**
	 * Сохраняет JSON-файл словаря на GitHub
	 */
	async save(vocabulary: Vocabulary): Promise<void> {
		// сначала нужно получить SHA текущего файла, чтобы GitHub разрешил обновление
		const urlGet = `${this.repoUrl}/contents/${this.path}?ref=${this.branch}`;
		const resGet = await fetch(urlGet, {
			headers: {
				Authorization: `token ${this.repoToken}`,
				Accept: "application/vnd.github+json"
			}
		});

		if (!resGet.ok) {
			throw new Error(`GitHub get SHA failed: ${resGet.statusText}`);
		}

		const dataGet = await resGet.json();
		const sha = dataGet.sha; // текущий SHA файла на GitHub

		// теперь создаём PUT-запрос на обновление
		const urlPut = `${this.repoUrl}/contents/${this.path}`;

		const body = {
			message: `Update vocabulary ${new Date().toISOString()}`,
			content: btoa(JSON.stringify(vocabulary, null, 2)), // Base64
			sha,
			branch: this.branch
		};

		const resPut = await fetch(urlPut, {
			method: "PUT",
			headers: {
				Authorization: `token ${this.repoToken}`,
				Accept: "application/vnd.github+json",
				"Content-Type": "application/json"
			},
			body: JSON.stringify(body)
		});

		if (!resPut.ok) {
			throw new Error(`GitHub save failed: ${resPut.statusText}`);
		}

		console.info("Vocabulary saved to GitHub successfully");
	}
}
