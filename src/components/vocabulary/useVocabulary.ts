"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { Entry } from "@/lib/domain/Entry";
import { createEntry } from "@/lib/domain/vocabularyRules";
import {
  clearDraft,
  getDraft,
  setDraft,
  subscribeDraft,
} from "@/lib/storage/LocalDraftStorage";

const noopSubscribe = () => () => {};
const returnNull = () => null;

function useDraft(enabled: boolean): Entry[] | null {
  return useSyncExternalStore(
    enabled ? subscribeDraft : noopSubscribe,
    enabled ? getDraft : returnNull,
    returnNull,
  );
}

export interface UseVocabularyResult {
  entries: Entry[];
  isDirty: boolean;
  addEntry: (isWord: boolean) => void;
  updateEntry: (id: string, patch: Partial<Entry>) => void;
  removeEntry: (id: string) => void;
  discard: () => void;
  markSaved: () => void;
}

export function useVocabulary(
  initial: Entry[],
  { enableDraft }: { enableDraft: boolean },
): UseVocabularyResult {
  const draft = useDraft(enableDraft);
  const entries = draft ?? initial;
  const isDirty = enableDraft && draft !== null;

  const mutate = useCallback(
    (mutator: (current: Entry[]) => Entry[]) => {
      if (!enableDraft) return;
      const current = getDraft() ?? initial;
      setDraft(mutator(current));
    },
    [enableDraft, initial],
  );

  const addEntry = useCallback(
    (isWord: boolean) => mutate((cur) => [...cur, createEntry(isWord)]),
    [mutate],
  );

  const updateEntry = useCallback(
    (id: string, patch: Partial<Entry>) =>
      mutate((cur) => cur.map((e) => (e.id === id ? { ...e, ...patch } : e))),
    [mutate],
  );

  const removeEntry = useCallback(
    (id: string) => mutate((cur) => cur.filter((e) => e.id !== id)),
    [mutate],
  );

  const discard = useCallback(() => clearDraft(), []);
  const markSaved = useCallback(() => clearDraft(), []);

  return {
    entries,
    isDirty,
    addEntry,
    updateEntry,
    removeEntry,
    discard,
    markSaved,
  };
}
