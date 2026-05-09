"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { Entry } from "@/lib/domain/Entry";
import { EditableCell } from "./EditableCell";

export function VocabularyTable({
  entries,
  isWord,
  isAdmin,
  onAdd,
  onUpdate,
  onRemove,
}: {
  entries: Entry[];
  isWord: boolean;
  isAdmin: boolean;
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<Entry>) => void;
  onRemove: (id: string) => void;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<Entry>[]>(() => {
    const cols: ColumnDef<Entry>[] = [
      {
        accessorKey: "pl",
        header: "Polish",
        cell: ({ row }) =>
          isAdmin ? (
            <EditableCell
              value={row.original.pl}
              placeholder="po polsku"
              onCommit={(v) => onUpdate(row.original.id, { pl: v })}
            />
          ) : (
            <span>{row.original.pl}</span>
          ),
      },
      {
        accessorKey: "ru",
        header: "Russian",
        cell: ({ row }) =>
          isAdmin ? (
            <EditableCell
              value={row.original.ru}
              placeholder="по-русски"
              onCommit={(v) => onUpdate(row.original.id, { ru: v })}
            />
          ) : (
            <span>{row.original.ru}</span>
          ),
      },
    ];
    if (isAdmin) {
      cols.push({
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => onRemove(row.original.id)}
            aria-label="Delete"
            className="opacity-60 hover:text-red-600 hover:opacity-100"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ),
      });
    }
    return cols;
  }, [isAdmin, onUpdate, onRemove]);

  const table = useReactTable({
    data: entries,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Filter…"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="rounded border px-3 py-1 text-sm"
        />
        {isAdmin && (
          <button
            type="button"
            onClick={onAdd}
            className="ml-auto flex items-center gap-1 rounded border px-3 py-1 text-sm hover:bg-black/5"
          >
            <Plus className="h-4 w-4" />
            Add {isWord ? "word" : "phrase"}
          </button>
        )}
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="border-b text-left">
              {hg.headers.map((h) => {
                const canSort = h.column.getCanSort();
                const sorted = h.column.getIsSorted();
                return (
                  <th key={h.id} className="px-2 py-2 font-medium">
                    {h.isPlaceholder ? null : (
                      <button
                        type="button"
                        onClick={h.column.getToggleSortingHandler()}
                        disabled={!canSort}
                        className="flex items-center gap-1"
                      >
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {sorted === "asc" && <ChevronUp className="h-3 w-3" />}
                        {sorted === "desc" && (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </button>
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b last:border-b-0">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-2 py-1">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
          {table.getRowModel().rows.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-2 py-6 text-center opacity-60"
              >
                No entries.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
