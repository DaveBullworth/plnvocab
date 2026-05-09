"use client";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <div className="max-w-md text-center">
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="mt-2 text-sm opacity-80">{error.message}</p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 rounded border px-3 py-1.5 text-sm"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
