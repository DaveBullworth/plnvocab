"use client";

import { useMemo } from "react";
import type { ColumnDef, SortingFn } from "@tanstack/react-table";
import type { Entry } from "@/lib/domain/Entry";
import { LANGUAGE_LABELS, type Lng } from "@/lib/domain/Lng";

const ruCollator = new Intl.Collator("ru");
const collatorsByLng: Record<Lng, Intl.Collator> = {
  pl: new Intl.Collator("pl"),
  en: new Intl.Collator("en"),
};

function makeLocaleSort(collator: Intl.Collator): SortingFn<Entry> {
  return (a, b, columnId) =>
    collator.compare(
      String(a.getValue(columnId) ?? ""),
      String(b.getValue(columnId) ?? ""),
    );
}

export function useVocabularyColumns({
  lng,
  isWord,
  renderOriginCell,
  renderRuCell,
  renderActionsCell,
}: {
  lng: Lng;
  isWord: boolean;
  renderOriginCell: (entry: Entry) => React.ReactNode;
  renderRuCell: (entry: Entry) => React.ReactNode;
  renderActionsCell: (entry: Entry) => React.ReactNode;
}): ColumnDef<Entry>[] {
  return useMemo<ColumnDef<Entry>[]>(
    () => [
      {
        accessorKey: "origin",
        header: `${LANGUAGE_LABELS[lng]} ${isWord ? "word" : "phrase"}`,
        sortingFn: makeLocaleSort(collatorsByLng[lng]),
        cell: ({ row }) => renderOriginCell(row.original),
      },
      {
        accessorKey: "ru",
        header: "Russian",
        sortingFn: makeLocaleSort(ruCollator),
        cell: ({ row }) => renderRuCell(row.original),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => renderActionsCell(row.original),
      },
    ],
    [lng, isWord, renderOriginCell, renderRuCell, renderActionsCell],
  );
}
