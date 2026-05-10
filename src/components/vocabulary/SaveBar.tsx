"use client";

import { Save, X } from "lucide-react";
import type { Entry } from "@/lib/domain/Entry";
import { useSaveVocabulary } from "./useSaveVocabulary";

export function SaveBar({
	entries,
	isDirty,
	onDiscard,
	onSaved
}: {
	entries: Entry[];
	isDirty: boolean;
	onDiscard: () => void;
	onSaved: () => void;
}) {
	const { save, isPending, error } = useSaveVocabulary(entries, onSaved);

	if (!isDirty) return null;

	return (
		<div className="fixed inset-x-0 bottom-0 z-10 border-t bg-[var(--background)] text-[var(--foreground)] shadow-lg">
			<div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3 text-sm">
				<div className="flex items-center gap-2">
					<span className="opacity-80">Unsaved changes</span>
					{error && <span className="text-red-600 dark:text-red-400">{error}</span>}
				</div>
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={onDiscard}
						disabled={isPending}
						className="flex items-center gap-1 rounded border px-3 py-1.5 hover:bg-black/5 disabled:opacity-50 dark:hover:bg-white/10"
					>
						<X className="h-4 w-4" /> Discard
					</button>
					<button
						type="button"
						disabled={isPending}
						onClick={save}
						className="flex items-center gap-1 rounded bg-black px-3 py-1.5 text-white disabled:opacity-50 dark:bg-white dark:text-black"
					>
						<Save className="h-4 w-4" />
						{isPending ? "Saving…" : "Save"}
					</button>
				</div>
			</div>
		</div>
	);
}
