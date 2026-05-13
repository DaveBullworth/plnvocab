"use client";

import { useRef, useState } from "react";
import { X } from "lucide-react";
import { parseExport } from "@/lib/db/format";
import {
  importEntries,
  fetchLegacyEntries,
  type ImportMode,
} from "@/lib/db/io";
import type { Entry } from "@/lib/domain/Entry";

export function ImportDialog({ onClose }: { onClose: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsed, setParsed] = useState<
    | { entries: Entry[]; warnings: string[] }
    | null
  >(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [mode, setMode] = useState<ImportMode>("merge");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setParseError(null);
    setParsed(null);
    setStatus(null);
    try {
      const text = await file.text();
      const { payload, warnings } = parseExport(text);
      setParsed({ entries: payload.entries, warnings });
    } catch (err) {
      setParseError(err instanceof Error ? err.message : String(err));
    }
  }

  async function doImport() {
    if (!parsed) return;
    setBusy(true);
    try {
      await importEntries(parsed.entries, mode);
      setStatus(`Imported ${parsed.entries.length} entries (${mode}).`);
      setParsed(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setStatus(
        `Error: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setBusy(false);
    }
  }

  async function doLegacyImport() {
    setBusy(true);
    setStatus(null);
    try {
      const entries = await fetchLegacyEntries();
      await importEntries(entries, "merge");
      setStatus(`Imported ${entries.length} entries from plnvocab MVP.`);
    } catch (err) {
      setStatus(
        `Error: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded border border-black/15 bg-background p-5 shadow-lg dark:border-white/15"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Import vocabulary</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="opacity-60 hover:opacity-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-medium opacity-70">From file</h3>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={onFileChange}
            disabled={busy}
            className="text-sm file:mr-3 file:rounded file:border-0 file:bg-foreground file:px-3 file:py-1.5 file:text-sm file:text-background"
          />
          {parsed && (
            <div className="text-xs opacity-70">
              {parsed.entries.length} entries detected
              {parsed.warnings.length > 0
                ? `, ${parsed.warnings.length} skipped`
                : ""}
              .
            </div>
          )}
          {parseError && (
            <div className="text-xs text-red-500">{parseError}</div>
          )}

          <fieldset
            className="flex gap-4 text-sm"
            disabled={busy || !parsed}
          >
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                name="mode"
                value="merge"
                checked={mode === "merge"}
                onChange={() => setMode("merge")}
              />
              Merge
            </label>
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                name="mode"
                value="replace"
                checked={mode === "replace"}
                onChange={() => setMode("replace")}
              />
              Replace all
            </label>
          </fieldset>
          {mode === "replace" && parsed && (
            <p className="text-xs text-red-500">
              ⚠ This will delete all current entries.
            </p>
          )}

          <button
            type="button"
            disabled={!parsed || busy}
            onClick={doImport}
            className="rounded bg-foreground px-3 py-1.5 text-sm text-background disabled:opacity-40"
          >
            Import
          </button>
        </div>

        <div className="my-5 flex items-center gap-3 text-xs opacity-60">
          <hr className="flex-1 border-black/10 dark:border-white/10" />
          <span>or</span>
          <hr className="flex-1 border-black/10 dark:border-white/10" />
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-medium opacity-70">
            From plnvocab MVP (legacy)
          </h3>
          <p className="text-xs opacity-60">
            Fetches the dataset from the MVP&apos;s data branch and converts
            it to v2 format (Polish only). Merges into your existing
            database.
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={doLegacyImport}
            className="rounded border border-black/15 px-3 py-1.5 text-sm hover:bg-black/5 disabled:opacity-40 dark:border-white/15 dark:hover:bg-white/5"
          >
            Import legacy data
          </button>
        </div>

        {status && <div className="mt-4 text-sm">{status}</div>}
      </div>
    </div>
  );
}
