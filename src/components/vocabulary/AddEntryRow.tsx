"use client";

import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import { addEntry } from "@/lib/db/queries";
import type { Lng } from "@/lib/domain/Lng";
import { PolishLettersPopover } from "@/components/common/PolishLettersPopover";

export function AddEntryRow({ lng, isWord }: { lng: Lng; isWord: boolean }) {
  const [origin, setOrigin] = useState("");
  const [ru, setRu] = useState("");
  const [originFocused, setOriginFocused] = useState(false);
  const originRef = useRef<HTMLInputElement>(null);

  const canSubmit = origin.trim() !== "" && ru.trim() !== "";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    await addEntry({
      origin: origin.trim(),
      ru: ru.trim(),
      isWord,
      lng,
    });
    setOrigin("");
    setRu("");
    originRef.current?.focus();
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-start gap-2">
      <div className="relative flex-1 min-w-[10rem]">
        <input
          ref={originRef}
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          onFocus={() => setOriginFocused(true)}
          onBlur={() => setOriginFocused(false)}
          placeholder={isWord ? "New word" : "New phrase"}
          className="w-full rounded border border-black/10 bg-transparent px-2 py-1 text-sm focus:border-black/40 focus:outline-none dark:border-white/10 dark:focus:border-white/40"
        />
        {lng === "pl" && originFocused && (
          <PolishLettersPopover inputRef={originRef} onInsert={setOrigin} />
        )}
      </div>
      <input
        value={ru}
        onChange={(e) => setRu(e.target.value)}
        placeholder="Russian"
        className="flex-1 min-w-[10rem] rounded border border-black/10 bg-transparent px-2 py-1 text-sm focus:border-black/40 focus:outline-none dark:border-white/10 dark:focus:border-white/40"
      />
      <button
        type="submit"
        disabled={!canSubmit}
        className="flex items-center gap-1 rounded border border-black/10 px-3 py-1 text-sm disabled:opacity-40 enabled:hover:bg-black/5 dark:border-white/10 dark:enabled:hover:bg-white/5"
      >
        <Plus size={14} /> Add
      </button>
    </form>
  );
}
