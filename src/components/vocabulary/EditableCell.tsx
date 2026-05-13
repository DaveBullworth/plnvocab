"use client";

import { useRef, useState } from "react";
import { PolishLettersPopover } from "@/components/common/PolishLettersPopover";

interface Props {
  value: string;
  showPolishHelper: boolean;
  onCommit: (next: string) => void | Promise<void>;
}

export function EditableCell(props: Props) {
  // key={value} resets local draft if external value changes (per feedback_react_patterns).
  return <EditableCellInner key={props.value} {...props} />;
}

function EditableCellInner({ value, showPolishHelper, onCommit }: Props) {
  const [draft, setDraft] = useState(value);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function commit() {
    const next = draft.trim();
    if (next === "" || next === value) return;
    onCommit(next);
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          commit();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur();
          } else if (e.key === "Escape") {
            setDraft(value);
            e.currentTarget.blur();
          }
        }}
        className="w-full rounded border border-black/10 bg-transparent px-2 py-1 text-sm focus:border-black/40 focus:outline-none dark:border-white/10 dark:focus:border-white/40"
      />
      {showPolishHelper && focused && (
        <PolishLettersPopover inputRef={inputRef} onInsert={setDraft} />
      )}
    </div>
  );
}
