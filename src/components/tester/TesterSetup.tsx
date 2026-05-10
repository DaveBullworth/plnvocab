"use client";

import { useState } from "react";

export type TestKind = "words" | "phrases";

export interface TesterConfig {
  kinds: TestKind[];
  count: number;
}

const KINDS: TestKind[] = ["words", "phrases"];

export function TesterSetup({
  availableWords,
  availablePhrases,
  onStart,
}: {
  availableWords: number;
  availablePhrases: number;
  onStart: (cfg: TesterConfig) => void;
}) {
  const [kinds, setKinds] = useState<TestKind[]>(["words"]);
  const [countText, setCountText] = useState("10");

  const count = Number(countText);
  const isValidCount =
    countText !== "" && Number.isInteger(count) && count >= 1 && count <= 99;

  const availableForKinds =
    (kinds.includes("words") ? availableWords : 0) +
    (kinds.includes("phrases") ? availablePhrases : 0);

  const canStart = kinds.length > 0 && isValidCount && availableForKinds > 0;

  const toggleKind = (k: TestKind) => {
    setKinds((prev) =>
      prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k],
    );
  };

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-12">
      <h1 className="text-2xl font-semibold">Tester</h1>

      <div className="flex flex-col gap-2">
        <span className="text-sm opacity-70">Include</span>
        <div className="flex gap-2">
          {KINDS.map((k) => {
            const selected = kinds.includes(k);
            const available = k === "words" ? availableWords : availablePhrases;
            return (
              <button
                key={k}
                type="button"
                onClick={() => toggleKind(k)}
                aria-pressed={selected}
                className={`flex-1 rounded border px-4 py-2 text-sm capitalize transition-colors ${
                  selected
                    ? "border-blue-500 bg-blue-500 text-white"
                    : "hover:bg-black/5 dark:hover:bg-white/10"
                }`}
              >
                {k}
                <span className="ml-2 text-xs opacity-70">({available})</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="count" className="text-sm opacity-70">
          Number of items (1–99)
        </label>
        <input
          id="count"
          type="number"
          inputMode="numeric"
          min={1}
          max={99}
          value={countText}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "" || /^\d{1,2}$/.test(v)) setCountText(v);
          }}
          className="rounded border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-400"
        />
      </div>

      <button
        type="button"
        disabled={!canStart}
        onClick={() => onStart({ kinds, count })}
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-40 dark:bg-white dark:text-black"
      >
        Start test
      </button>
    </main>
  );
}
