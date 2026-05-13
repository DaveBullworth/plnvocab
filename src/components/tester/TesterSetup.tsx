"use client";

import { useState } from "react";
import clsx from "clsx";
import { LANGUAGE_LABELS, type Lng } from "@/lib/domain/Lng";

export type TestKind = "words" | "phrases";

export interface TesterConfig {
  kinds: TestKind[];
  count: number;
}

const KINDS: TestKind[] = ["words", "phrases"];

export function TesterSetup({
  lng,
  availableWords,
  availablePhrases,
  onStart,
}: {
  lng: Lng;
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

  function toggleKind(k: TestKind) {
    setKinds((prev) =>
      prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k],
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-md flex-col gap-6">
      <h1 className="text-xl font-semibold">
        {LANGUAGE_LABELS[lng]} — Tester
      </h1>

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
                className={clsx(
                  "flex-1 rounded border px-4 py-2 text-sm capitalize transition-colors",
                  selected
                    ? "border-foreground bg-foreground text-background"
                    : "border-black/15 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/5",
                )}
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
          className="rounded border border-black/15 bg-transparent px-3 py-2 text-sm focus:border-black/40 focus:outline-none dark:border-white/15 dark:focus:border-white/40"
        />
      </div>

      <button
        type="button"
        disabled={!canStart}
        onClick={() => onStart({ kinds, count })}
        className="rounded bg-foreground px-4 py-2 text-sm text-background disabled:opacity-40"
      >
        Start test
      </button>

      {availableForKinds === 0 && kinds.length > 0 && (
        <p className="text-xs opacity-60">
          Nothing to test with the current selection. Add entries on the
          Words/Phrases pages first.
        </p>
      )}
    </section>
  );
}
