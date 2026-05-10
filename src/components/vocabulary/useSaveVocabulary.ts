"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { saveVocabularyAction } from "@/lib/actions/saveVocabularyAction";
import type { Entry } from "@/lib/domain/Entry";
import {
	findDuplicatePolish,
	type DuplicatePolishGroup
} from "@/lib/domain/vocabularyRules";

export interface UseSaveVocabularyResult {
	save: () => void;
	isPending: boolean;
	error: string | null;
}

export function useSaveVocabulary(
	entries: Entry[],
	onSaved: () => void
): UseSaveVocabularyResult {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [error, setError] = useState<string | null>(null);

	const save = useCallback(() => {
		setError(null);

		const duplicates = findDuplicatePolish(entries);
		if (duplicates.length > 0) {
			setError(formatDuplicateError(duplicates));
			return;
		}

		startTransition(async () => {
			try {
				await saveVocabularyAction(entries);
				onSaved();
				router.refresh();
			} catch (e) {
				setError(e instanceof Error ? e.message : "Failed to save");
			}
		});
	}, [entries, onSaved, router]);

	return { save, isPending, error };
}

function formatDuplicateError(duplicates: DuplicatePolishGroup[]): string {
	const list = duplicates
		.map(g => `"${g.values[0]}" (×${g.values.length})`)
		.join(", ");
	return `Duplicate Polish values: ${list}`;
}
