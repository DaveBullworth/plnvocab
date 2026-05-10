import "server-only";
import type { Entry } from "@/lib/domain/Entry";
import {
	CURRENT_VOCABULARY_VERSION,
	EMPTY_VOCABULARY,
	type VocabularyFile
} from "@/lib/domain/Vocabulary";
import { parseVocabularyFile, serializeVocabularyFile } from "@/lib/domain/vocabularyRules";

interface GitHubConfig {
	owner: string;
	repo: string;
	branch: string;
	path: string;
}

function getConfig(): GitHubConfig {
	const owner = process.env.GITHUB_OWNER;
	const repo = process.env.GITHUB_REPO;
	if (!owner || !repo) {
		throw new Error("GITHUB_OWNER and GITHUB_REPO must be set");
	}
	return {
		owner,
		repo,
		branch: process.env.GITHUB_DATA_BRANCH ?? "data",
		path: process.env.GITHUB_DATA_PATH ?? "data/vocabulary.json"
	};
}

function getToken(): string {
	const token = process.env.GITHUB_TOKEN;
	if (!token) throw new Error("GITHUB_TOKEN is not set");
	return token;
}

function contentsUrl(c: GitHubConfig): string {
	return `https://api.github.com/repos/${c.owner}/${c.repo}/contents/${c.path}`;
}

function authHeaders(token: string, extra?: Record<string, string>): HeadersInit {
	return {
		Authorization: `Bearer ${token}`,
		"X-GitHub-Api-Version": "2022-11-28",
		...extra
	};
}

export async function loadVocabulary(): Promise<VocabularyFile> {
	const c = getConfig();
	const token = getToken();

	const res = await fetch(`${contentsUrl(c)}?ref=${c.branch}`, {
		headers: authHeaders(token, { Accept: "application/vnd.github.raw" }),
		cache: "force-cache",
		next: { tags: ["vocabulary"] }
	});

	if (res.status === 404) {
		return EMPTY_VOCABULARY;
	}
	if (!res.ok) {
		throw new Error(`Failed to fetch vocabulary: ${res.status} ${res.statusText}`);
	}
	const json = await res.json();
	return parseVocabularyFile(json);
}

export async function saveVocabulary(entries: Entry[]): Promise<VocabularyFile> {
	const c = getConfig();
	const token = getToken();

	const file: VocabularyFile = {
		version: CURRENT_VOCABULARY_VERSION,
		updatedAt: new Date().toISOString(),
		entries
	};

	const content = Buffer.from(serializeVocabularyFile(file), "utf8").toString("base64");
	const sha = await getCurrentFileSha(c, token);

	const res = await fetch(`${contentsUrl(c)}?ref=${c.branch}`, {
		method: "PUT",
		headers: authHeaders(token, { Accept: "application/vnd.github+json" }),
		body: JSON.stringify({
			message: `Update vocabulary (${entries.length} entries)`,
			content,
			branch: c.branch,
			sha
		})
	});

	if (!res.ok) {
		const body = await res.text();
		throw new Error(`Failed to save vocabulary: ${res.status} ${body}`);
	}

	return file;
}

async function getCurrentFileSha(c: GitHubConfig, token: string): Promise<string | undefined> {
	const res = await fetch(`${contentsUrl(c)}?ref=${c.branch}`, {
		headers: authHeaders(token, { Accept: "application/vnd.github+json" }),
		cache: "no-store"
	});
	if (res.status === 404) return undefined;
	if (!res.ok) {
		throw new Error(`Failed to fetch current file sha: ${res.status}`);
	}
	const data = (await res.json()) as { sha: string };
	return data.sha;
}
