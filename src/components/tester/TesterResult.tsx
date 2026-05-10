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
    <main className="flex flex-1 items-center justify-center p-4">
      <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-sm rounded border bg-[var(--background)] p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-semibold">Test complete</h2>
          <div className="mb-6 flex flex-col gap-2 text-sm">
            <div>
              First-try correct:{" "}
              <strong>
                {correctFirstTry} / {total}
              </strong>
            </div>
            <div>
              Time: <strong className="font-mono tabular-nums">{time}</strong>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onExit}
              className="rounded border px-3 py-1.5 text-sm hover:bg-black/5 dark:hover:bg-white/10"
            >
              Exit
            </button>
            <button
              type="button"
              onClick={onRepeat}
              className="rounded bg-black px-3 py-1.5 text-sm text-white dark:bg-white dark:text-black"
            >
              Repeat
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
