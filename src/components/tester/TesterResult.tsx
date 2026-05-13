"use client";

export function TesterResult({
  correctFirstTry,
  total,
  time,
  onRepeat,
  onExit,
}: {
  correctFirstTry: number;
  total: number;
  time: string;
  onRepeat: () => void;
  onExit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded border border-black/15 bg-background p-6 shadow-lg dark:border-white/15">
        <h2 className="mb-4 text-xl font-semibold">Test complete</h2>
        <div className="mb-6 flex flex-col gap-2 text-sm">
          <div>
            First-try correct:{" "}
            <strong>
              {correctFirstTry} / {total}
            </strong>
          </div>
          <div>
            Time:{" "}
            <strong className="font-mono tabular-nums">{time}</strong>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onExit}
            className="rounded border border-black/15 px-3 py-1.5 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/5"
          >
            Exit
          </button>
          <button
            type="button"
            onClick={onRepeat}
            className="rounded bg-foreground px-3 py-1.5 text-sm text-background"
          >
            Repeat
          </button>
        </div>
      </div>
    </div>
  );
}
