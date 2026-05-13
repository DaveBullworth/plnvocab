"use client";

import { useCallback, useRef, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import clsx from "clsx";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import type { Entry } from "@/lib/domain/Entry";
import type { Lng } from "@/lib/domain/Lng";
import { updateEntry, deleteEntry } from "@/lib/db/queries";
import { PolishLettersPopover } from "@/components/common/PolishLettersPopover";
import { EditableCell } from "./EditableCell";
import { useVocabularyColumns } from "./useVocabularyColumns";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 30, 40, 50] as const;
const DEFAULT_PAGE_SIZE = 20;

export function VocabularyTable({
  entries,
  lng,
  isWord,
}: {
  entries: Entry[];
  lng: Lng;
  isWord: boolean;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [filterFocused, setFilterFocused] = useState(false);
  const filterInputRef = useRef<HTMLInputElement>(null);

  const showPolishHelper = lng === "pl";

  const renderOriginCell = useCallback(
    (entry: Entry) => (
      <EditableCell
        value={entry.origin}
        showPolishHelper={showPolishHelper}
        onCommit={(next) => updateEntry(entry.id, { origin: next })}
      />
    ),
    [showPolishHelper],
  );

  const renderRuCell = useCallback(
    (entry: Entry) => (
      <EditableCell
        value={entry.ru}
        showPolishHelper={false}
        onCommit={(next) => updateEntry(entry.id, { ru: next })}
      />
    ),
    [],
  );

  const renderActionsCell = useCallback(
    (entry: Entry) => (
      <button
        type="button"
        onClick={() => deleteEntry(entry.id)}
        aria-label="Delete entry"
        className="rounded p-1 opacity-60 hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/5"
      >
        <Trash2 size={16} />
      </button>
    ),
    [],
  );

  const columns = useVocabularyColumns({
    lng,
    isWord,
    renderOriginCell,
    renderRuCell,
    renderActionsCell,
  });

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table is intentionally not memoizable; React Compiler skips this component.
  const table = useReactTable({
    data: entries,
    columns,
    state: { sorting, globalFilter },
    initialState: {
      pagination: { pageIndex: 0, pageSize: DEFAULT_PAGE_SIZE },
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    // Stay on the current page when entries update (cell edits, live queries).
    autoResetPageIndex: false,
  });

  const total = entries.length;
  const filteredCount = table.getFilteredRowModel().rows.length;
  const rows = table.getRowModel().rows;
  const pageCount = table.getPageCount();
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="relative w-full max-w-xs">
          <input
            ref={filterInputRef}
            type="text"
            placeholder="Filter…"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            onFocus={() => setFilterFocused(true)}
            onBlur={() => setFilterFocused(false)}
            className="w-full rounded border border-black/10 bg-transparent px-3 py-1 text-sm focus:border-black/40 focus:outline-none dark:border-white/10 dark:focus:border-white/40"
          />
          {showPolishHelper && filterFocused && (
            <PolishLettersPopover
              inputRef={filterInputRef}
              onInsert={setGlobalFilter}
            />
          )}
        </div>
        <p className="ml-auto text-xs opacity-60">
          {globalFilter ? `${filteredCount} / ${total}` : `${total} total`}
        </p>
      </div>

      <table className="w-full border-collapse text-sm">
        <thead className="text-left text-xs uppercase opacity-60">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const sorted = header.column.getIsSorted();
                return (
                  <th
                    key={header.id}
                    className={clsx(
                      "py-2 pr-3 font-medium",
                      canSort && "cursor-pointer select-none",
                    )}
                    onClick={
                      canSort
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                  >
                    <span className="inline-flex items-center gap-1">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {sorted === "asc" && <ChevronUp size={12} />}
                      {sorted === "desc" && <ChevronDown size={12} />}
                    </span>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="py-4 text-center text-sm opacity-60"
              >
                {globalFilter ? "No matches." : "No entries on this page."}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row.id}
                className="border-t border-black/5 dark:border-white/10"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="py-1 pr-3 align-top">
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext(),
                    )}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label className="flex items-center gap-1.5 text-xs opacity-60">
          Rows per page:
          <select
            value={pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="rounded border border-black/10 bg-transparent px-1.5 py-0.5 dark:border-white/10"
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        {pageCount > 1 && (
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
              className="rounded border border-black/10 px-2 py-1 disabled:opacity-30 enabled:hover:bg-black/5 dark:border-white/10 dark:enabled:hover:bg-white/5"
            >
              Prev
            </button>
            <span className="opacity-60">
              {pageIndex + 1} / {pageCount}
            </span>
            <button
              type="button"
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
              className="rounded border border-black/10 px-2 py-1 disabled:opacity-30 enabled:hover:bg-black/5 dark:border-white/10 dark:enabled:hover:bg-white/5"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
