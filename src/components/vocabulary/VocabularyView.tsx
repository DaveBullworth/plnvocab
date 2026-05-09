"use client";

import { useMemo } from "react";
import { useIsAdmin } from "@/components/auth/AdminProvider";
import type { Entry } from "@/lib/domain/Entry";
import { SaveBar } from "./SaveBar";
import { useVocabulary } from "./useVocabulary";
import { VocabularyTable } from "./VocabularyTable";

export function VocabularyView({
  initial,
  kind,
}: {
  initial: Entry[];
  kind: "word" | "phrase";
}) {
  const isAdmin = useIsAdmin();
  const v = useVocabulary(initial, { enableDraft: isAdmin });
  const isWord = kind === "word";

  const filtered = useMemo(
    () => v.entries.filter((e) => e.isWord === isWord),
    [v.entries, isWord],
  );

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 pb-24">
      <h1 className="mb-4 text-xl font-semibold">
        {isWord ? "Words" : "Phrases"}
      </h1>
      <VocabularyTable
        entries={filtered}
        isWord={isWord}
        isAdmin={isAdmin}
        onAdd={() => v.addEntry(isWord)}
        onUpdate={v.updateEntry}
        onRemove={v.removeEntry}
      />
      <SaveBar
        entries={v.entries}
        isDirty={v.isDirty}
        onDiscard={v.discard}
        onSaved={v.markSaved}
      />
    </main>
  );
}
