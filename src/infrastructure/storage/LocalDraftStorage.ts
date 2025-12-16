import type { Vocabulary } from "@/features/vocabulary/domain/Vocabulary";

const KEY = "vocabulary:draft";

export const LocalDraftStorage = {
	load(): Vocabulary | null {
		const raw = localStorage.getItem(KEY);
		return raw ? JSON.parse(raw) : null;
	},

	save(vocabulary: Vocabulary) {
		localStorage.setItem(KEY, JSON.stringify(vocabulary));
	},

	clear() {
		localStorage.removeItem(KEY);
	}
};
