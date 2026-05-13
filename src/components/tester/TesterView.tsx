"use client";

import { useState } from "react";
import { useEntries } from "@/lib/db/queries";
import type { Entry } from "@/lib/domain/Entry";
import type { Lng } from "@/lib/domain/Lng";
import { TesterSetup, type TesterConfig } from "./TesterSetup";
import { TesterRound } from "./TesterRound";

type Phase =
  | { kind: "setup" }
  | { kind: "round"; roster: Entry[]; runId: number };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isUsable(e: Entry): boolean {
  return e.origin.trim() !== "" && e.ru.trim() !== "";
}

export function TesterView({ lng }: { lng: Lng }) {
  const words = useEntries(lng, true);
  const phrases = useEntries(lng, false);
  const [phase, setPhase] = useState<Phase>({ kind: "setup" });

  if (words === undefined || phrases === undefined) {
    return <p className="text-sm opacity-60">Loading…</p>;
  }

  const usableWords = words.filter(isUsable);
  const usablePhrases = phrases.filter(isUsable);

  if (phase.kind === "setup") {
    return (
      <TesterSetup
        lng={lng}
        availableWords={usableWords.length}
        availablePhrases={usablePhrases.length}
        onStart={(cfg: TesterConfig) => {
          const pool: Entry[] = [];
          if (cfg.kinds.includes("words")) pool.push(...usableWords);
          if (cfg.kinds.includes("phrases")) pool.push(...usablePhrases);
          const roster = shuffle(pool).slice(
            0,
            Math.min(cfg.count, pool.length),
          );
          if (roster.length === 0) return;
          setPhase({ kind: "round", roster, runId: 1 });
        }}
      />
    );
  }

  return (
    <TesterRound
      key={phase.runId}
      roster={phase.roster}
      lng={lng}
      onExit={() => setPhase({ kind: "setup" })}
      onRepeat={() =>
        setPhase({
          kind: "round",
          roster: shuffle(phase.roster),
          runId: phase.runId + 1,
        })
      }
    />
  );
}
