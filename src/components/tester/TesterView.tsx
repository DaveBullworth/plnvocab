"use client";

import { useState } from "react";
import type { Entry } from "@/lib/domain/Entry";
import { TesterRound } from "./TesterRound";
import { TesterSetup, type TesterConfig } from "./TesterSetup";

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
  return e.pl.trim() !== "" && e.ru.trim() !== "";
}

function buildRoster(entries: Entry[], cfg: TesterConfig): Entry[] {
  const pool = entries.filter((e) => {
    if (!isUsable(e)) return false;
    if (e.isWord) return cfg.kinds.includes("words");
    return cfg.kinds.includes("phrases");
  });
  return shuffle(pool).slice(0, Math.min(cfg.count, pool.length));
}

export function TesterView({ entries }: { entries: Entry[] }) {
  const [phase, setPhase] = useState<Phase>({ kind: "setup" });

  if (phase.kind === "setup") {
    const availableWords = entries.filter((e) => e.isWord && isUsable(e)).length;
    const availablePhrases = entries.filter(
      (e) => !e.isWord && isUsable(e),
    ).length;

    return (
      <TesterSetup
        availableWords={availableWords}
        availablePhrases={availablePhrases}
        onStart={(cfg) => {
          const roster = buildRoster(entries, cfg);
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
