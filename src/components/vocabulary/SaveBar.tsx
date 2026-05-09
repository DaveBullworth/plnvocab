"use client";

import { Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveVocabularyAction } from "@/lib/actions/saveVocabularyAction";
import type { Entry } from "@/lib/domain/Entry";

export function SaveBar({
  entries,
  isDirty,
  onDiscard,
  onSaved,
}: {
  entries: Entry[];
  isDirty: boolean;
  onDiscard: () => void;
  onSaved: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!isDirty) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-10 border-t bg-white shadow-lg">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="opacity-80">Unsaved changes</span>
          {error && <span className="text-red-600">{error}</span>}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDiscard}
            disabled={isPending}
            className="flex items-center gap-1 rounded border px-3 py-1.5 disabled:opacity-50"
          >
            <X className="h-4 w-4" /> Discard
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              setError(null);
              startTransition(async () => {
                try {
                  await saveVocabularyAction(entries);
                  onSaved();
                  router.refresh();
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Failed to save");
                }
              });
            }}
            className="flex items-center gap-1 rounded bg-black px-3 py-1.5 text-white disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isPending ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
