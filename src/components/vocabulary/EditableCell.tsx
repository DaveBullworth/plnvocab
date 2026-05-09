"use client";

import { useState } from "react";

export function EditableCell({
  value,
  onCommit,
  placeholder,
}: {
  value: string;
  onCommit: (next: string) => void;
  placeholder?: string;
}) {
  const [local, setLocal] = useState(value);
  const [prevValue, setPrevValue] = useState(value);

  if (value !== prevValue) {
    setPrevValue(value);
    setLocal(value);
  }

  return (
    <input
      type="text"
      value={local}
      placeholder={placeholder}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => {
        if (local !== value) onCommit(local);
      }}
      className="w-full bg-transparent px-1 py-0.5 outline-none focus:ring-1 focus:ring-blue-400"
    />
  );
}
