"use client";

import { type RefObject } from "react";

const POLISH_LETTERS = ["ą", "ć", "ę", "ł", "ń", "ó", "ś", "ź", "ż"] as const;

export function PolishLettersPopover({
  inputRef,
  onInsert,
}: {
  inputRef: RefObject<HTMLInputElement | null>;
  onInsert: (next: string) => void;
}) {
  function insert(letter: string) {
    const input = inputRef.current;
    if (!input) return;
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    const next = input.value.slice(0, start) + letter + input.value.slice(end);
    onInsert(next);
    queueMicrotask(() => {
      input.focus();
      input.setSelectionRange(start + 1, start + 1);
    });
  }

  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {POLISH_LETTERS.map((letter) => (
        <button
          key={letter}
          type="button"
          // preventDefault keeps focus on the input so onBlur doesn't fire mid-edit
          onMouseDown={(e) => {
            e.preventDefault();
            insert(letter);
          }}
          className="rounded border border-black/15 px-2 py-0.5 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/5"
        >
          {letter}
        </button>
      ))}
    </div>
  );
}
