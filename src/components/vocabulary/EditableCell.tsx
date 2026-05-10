"use client";

import { useRef, useState } from "react";

const PL_LETTERS = ["ą", "ć", "ę", "ł", "ń", "ó", "ś", "ź", "ż"] as const;

export function EditableCell({
  value,
  onCommit,
  placeholder,
  polishHelper = false,
}: {
  value: string;
  onCommit: (next: string) => void;
  placeholder?: string;
  polishHelper?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [local, setLocal] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  const [focused, setFocused] = useState(false);

  if (value !== prevValue) {
    setPrevValue(value);
    setLocal(value);
  }

  const insertChar = (ch: string) => {
    const input = inputRef.current;
    if (!input) return;
    const start = input.selectionStart ?? local.length;
    const end = input.selectionEnd ?? local.length;
    const next = local.slice(0, start) + ch + local.slice(end);
    setLocal(next);
    requestAnimationFrame(() => {
      input.focus();
      const caret = start + ch.length;
      input.setSelectionRange(caret, caret);
    });
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={local}
        placeholder={placeholder}
        onChange={(e) => setLocal(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          if (local !== value) onCommit(local);
        }}
        className="w-full bg-transparent px-1 py-0.5 outline-none focus:ring-1 focus:ring-blue-400"
      />
      {focused && polishHelper && (
        <div className="absolute left-0 top-full z-20 mt-1 flex gap-1 rounded border bg-[var(--background)] p-1 shadow">
          {PL_LETTERS.map((ch) => (
            <button
              key={ch}
              type="button"
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => insertChar(ch)}
              className="rounded px-1.5 py-0.5 text-sm hover:bg-black/5"
            >
              {ch}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
