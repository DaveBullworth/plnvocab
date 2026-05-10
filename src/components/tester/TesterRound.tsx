"use client";

import { Eye, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PolishLettersPopover, usePolishLetters } from "@/components/common/PolishLetters";
import type { Entry } from "@/lib/domain/Entry";
import { TesterResult } from "./TesterResult";

const MAX_INPUT = 200;

function formatTime(seconds: number): string {
  const mm = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const ss = (seconds % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

export function TesterRound({
  roster,
  onExit,
  onRepeat,
}: {
  roster: Entry[];
  onExit: () => void;
  onRepeat: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [errored, setErrored] = useState(false);
  const [revealOpen, setRevealOpen] = useState(false);
  const [correctFirstTry, setCorrectFirstTry] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const helper = usePolishLetters({
    inputRef,
    value: input,
    onChange: setInput,
    maxLength: MAX_INPUT,
  });

  useEffect(() => {
    if (done) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [done]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [index]);

  const current = roster[index];

  const handleSubmit = () => {
    if (input.trim() === "" || !current) return;
    if (normalize(input) === normalize(current.pl)) {
      const wasFirstTry = !errored;
      if (index + 1 >= roster.length) {
        if (wasFirstTry) setCorrectFirstTry((c) => c + 1);
        setDone(true);
      } else {
        if (wasFirstTry) setCorrectFirstTry((c) => c + 1);
        setIndex((i) => i + 1);
        setInput("");
        setErrored(false);
        setRevealOpen(false);
      }
    } else {
      setErrored(true);
    }
  };

  if (done) {
    return (
      <TesterResult
        correctFirstTry={correctFirstTry}
        total={roster.length}
        time={formatTime(seconds)}
        onRepeat={onRepeat}
        onExit={onExit}
      />
    );
  }

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="absolute left-4 top-4 font-mono text-sm tabular-nums opacity-70">
        {formatTime(seconds)}
      </div>
      <button
        type="button"
        aria-label="Abort test"
        onClick={onExit}
        className="absolute right-4 top-4 opacity-60 hover:opacity-100"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="flex w-full max-w-md flex-col items-center gap-6">
        <div className="text-xs opacity-60">
          {index + 1} / {roster.length}
        </div>

        <div className="relative flex h-8 items-center justify-center">
          {errored && (
            <>
              <button
                type="button"
                aria-label="Reveal translation"
                onClick={() => setRevealOpen((o) => !o)}
                className="rounded border p-1 opacity-70 hover:opacity-100"
              >
                <Eye className="h-4 w-4" />
              </button>
              {revealOpen && (
                <div className="absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 whitespace-nowrap rounded border bg-[var(--background)] px-3 py-1 text-sm shadow">
                  {current.pl}
                </div>
              )}
            </>
          )}
        </div>

        <div className="text-center text-3xl font-bold">{current.ru}</div>

        <form
          className="flex w-full flex-col items-center gap-10"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="relative w-full">
            <input
              ref={inputRef}
              type="text"
              value={input}
              maxLength={MAX_INPUT}
              placeholder="po polsku"
              autoFocus
              onChange={(e) => setInput(e.target.value)}
              onFocus={helper.onFocus}
              onBlur={helper.onBlur}
              className={`w-full rounded border px-3 py-2 text-center outline-none focus:ring-1 ${
                errored
                  ? "border-red-500 focus:ring-red-400"
                  : "focus:ring-blue-400"
              }`}
            />
            {helper.isOpen && (
              <PolishLettersPopover align="center" onPick={helper.insertChar} />
            )}
          </div>

          <button
            type="submit"
            disabled={input.trim() === ""}
            className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-40 dark:bg-white dark:text-black"
          >
            Submit
          </button>
        </form>
      </div>
    </main>
  );
}
