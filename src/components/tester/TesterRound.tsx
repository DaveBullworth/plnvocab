"use client";

import { useEffect, useRef, useState } from "react";
import { Eye, X } from "lucide-react";
import clsx from "clsx";
import { PolishLettersPopover } from "@/components/common/PolishLettersPopover";
import type { Entry } from "@/lib/domain/Entry";
import type { Lng } from "@/lib/domain/Lng";
import { TesterResult } from "./TesterResult";

const MAX_INPUT = 200;

function formatTime(seconds: number): string {
  const mm = Math.floor(seconds / 60).toString().padStart(2, "0");
  const ss = (seconds % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

export function TesterRound({
  roster,
  lng,
  onExit,
  onRepeat,
}: {
  roster: Entry[];
  lng: Lng;
  onExit: () => void;
  onRepeat: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [errored, setErrored] = useState(false);
  const [revealOpen, setRevealOpen] = useState(false);
  const [correctFirstTry, setCorrectFirstTry] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [focused, setFocused] = useState(false);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (done) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [done]);

  const current = roster[index];

  function handleSubmit() {
    if (input.trim() === "" || !current) return;
    if (normalize(input) === normalize(current.origin)) {
      const firstTry = !errored;
      if (firstTry) setCorrectFirstTry((c) => c + 1);
      if (index + 1 >= roster.length) {
        setDone(true);
      } else {
        setIndex((i) => i + 1);
        setInput("");
        setErrored(false);
        setRevealOpen(false);
      }
    } else {
      setErrored(true);
    }
  }

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
    <div className="relative flex flex-1 flex-col items-center justify-center py-8">
      <div className="absolute left-0 top-0 font-mono text-sm tabular-nums opacity-70">
        {formatTime(seconds)}
      </div>
      <button
        type="button"
        aria-label="Abort test"
        onClick={onExit}
        className="absolute right-0 top-0 opacity-60 hover:opacity-100"
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
                className="rounded border border-black/15 p-1 opacity-70 hover:opacity-100 dark:border-white/15"
              >
                <Eye className="h-4 w-4" />
              </button>
              {revealOpen && (
                <div className="absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 whitespace-nowrap rounded border border-black/15 bg-background px-3 py-1 text-sm shadow dark:border-white/15">
                  {current.origin}
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
              key={index}
              type="text"
              value={input}
              maxLength={MAX_INPUT}
              placeholder={lng === "pl" ? "po polsku" : "in english"}
              autoFocus
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onChange={(e) => setInput(e.target.value)}
              className={clsx(
                "w-full rounded border bg-transparent px-3 py-2 text-center outline-none",
                errored
                  ? "border-red-500 focus:border-red-400"
                  : "border-black/15 focus:border-black/40 dark:border-white/15 dark:focus:border-white/40",
              )}
            />
            {lng === "pl" && focused && (
              <PolishLettersPopover inputRef={inputRef} onInsert={setInput} />
            )}
          </div>

          <button
            type="submit"
            disabled={input.trim() === ""}
            className="w-full rounded bg-foreground px-4 py-2 text-sm text-background disabled:opacity-40"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
