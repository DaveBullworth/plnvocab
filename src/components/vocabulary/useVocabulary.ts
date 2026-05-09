"use client";

import { useCallback, useEffect, useState } from "react";
import type { Entry } from "@/lib/domain/Entry";
import { createEntry } from "@/lib/domain/vocabularyRules";
import { localDraftStorage } from "@/lib/storage/LocalDraftStorage";

export interface UseVocabularyResult {
  entries: Entry[];
  isDirty: boolean;
  hydrated: boolean;
  addEntry: (isWord: boolean) => void;
  updateEntry: (id: string, patch: Partial<Entry>) => void;
  removeEntry: (id: string) => void;
  discard: () => void;
  markSaved: (cleaned: Entry[]) => void;
}

export function useVocabulary(
  initial: Entry[],
  { enableDraft }: { enableDraft: boolean },
): UseVocabularyResult {
  const [entries, setEntries] = useState<Entry[]>(initial);
  const [isDirty, setIsDirty] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (enableDraft) {
      const draft = localDraftStorage.load();
      if (draft) {
        setEntries(draft);
        setIsDirty(true);
      }
    }
    setHydrated(true);
  }, [enableDraft]);

  const persist = useCallback((next: Entry[]) => {
    localDraftStorage.save(next);
  }, []);

  const addEntry = useCallback(
    (isWord: boolean) => {
      const fresh = createEntry(isWord);
      setEntries((prev) => {
        const next = [...prev, fresh];
        persist(next);
        return next;
      });
      setIsDirty(true);
    },
    [persist],
  );

  const updateEntry = useCallback(
    (id: string, patch: Partial<Entry>) => {
      setEntries((prev) => {
        const next = prev.map((e) => (e.id === id ? { ...e, ...patch } : e));
        persist(next);
        return next;
      });
      setIsDirty(true);
    },
    [persist],
  );

  const removeEntry = useCallback(
    (id: string) => {
      setEntries((prev) => {
        const next = prev.filter((e) => e.id !== id);
        persist(next);
        return next;
      });
      setIsDirty(true);
    },
    [persist],
  );

  const discard = useCallback(() => {
    localDraftStorage.clear();
    setEntries(initial);
    setIsDirty(false);
  }, [initial]);

  const markSaved = useCallback((cleaned: Entry[]) => {
    localDraftStorage.clear();
    setEntries(cleaned);
    setIsDirty(false);
  }, []);

  return {
    entries,
    isDirty,
    hydrated,
    addEntry,
    updateEntry,
    removeEntry,
    discard,
    markSaved,
  };
}
