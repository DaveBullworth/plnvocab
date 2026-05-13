"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { X } from "lucide-react";
import { db } from "@/lib/db/db";
import { exportToJson, downloadJson } from "@/lib/db/io";

export function ExportConfirmDialog({ onClose }: { onClose: () => void }) {
  const count = useLiveQuery(() => db.entries.count());
  const [busy, setBusy] = useState(false);
  const filename = `plnvocab-${new Date().toISOString().slice(0, 10)}.json`;

  async function download() {
    setBusy(true);
    try {
      const json = await exportToJson();
      downloadJson(json);
      onClose();
    } finally {
      setBusy(false);
    }
  }

  const empty = count === 0;

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded border border-black/15 bg-background p-5 shadow-lg dark:border-white/15"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Export vocabulary</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="opacity-60 hover:opacity-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm">
          {count === undefined
            ? "Loading…"
            : empty
              ? "Your database is empty — nothing to export."
              : `Export ${count} ${count === 1 ? "entry" : "entries"} as JSON.`}
        </p>
        <p className="mt-2 text-xs opacity-60">
          File: <code className="font-mono">{filename}</code>
        </p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-black/15 px-3 py-1.5 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={download}
            disabled={busy || count === undefined || empty}
            className="rounded bg-foreground px-3 py-1.5 text-sm text-background disabled:opacity-40"
          >
            {busy ? "Preparing…" : "Download"}
          </button>
        </div>
      </div>
    </div>
  );
}
