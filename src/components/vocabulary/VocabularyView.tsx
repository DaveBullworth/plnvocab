"use client";

import { useEntries } from "@/lib/db/queries";
import { LANGUAGE_LABELS, type Lng } from "@/lib/domain/Lng";
import { AddEntryRow } from "./AddEntryRow";
import { VocabularyTable } from "./VocabularyTable";

export function VocabularyView({
  lng,
  isWord,
}: {
  lng: Lng;
  isWord: boolean;
}) {
  const entries = useEntries(lng, isWord);
  const title = isWord ? "Words" : "Phrases";

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">
        {LANGUAGE_LABELS[lng]} — {title}
      </h1>

      <AddEntryRow lng={lng} isWord={isWord} />

      {entries === undefined ? (
        <p className="text-sm opacity-60">Loading…</p>
      ) : entries.length === 0 ? (
        <p className="text-sm opacity-60">
          No {title.toLowerCase()} yet. Add one above.
        </p>
      ) : (
        <VocabularyTable entries={entries} lng={lng} isWord={isWord} />
      )}
    </section>
  );
}
