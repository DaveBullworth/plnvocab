"use client";

import {
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	type SortingState
} from "@tanstack/react-table";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PolishLettersPopover, usePolishLetters } from "@/components/common/PolishLetters";
import type { Entry } from "@/lib/domain/Entry";
import { useVocabularyColumns } from "./useVocabularyColumns";
import { DEFAULT_PAGE_SIZE, VocabularyPagination } from "./VocabularyPagination";

export function VocabularyTable({
	entries,
	isWord,
	isAdmin,
	onAdd,
	onUpdate,
	onRemove
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
	const filterInputRef = useRef<HTMLInputElement>(null);
	const filterHelper = usePolishLetters({
		inputRef: filterInputRef,
		value: globalFilter,
		onChange: setGlobalFilter
	});

	const columns = useVocabularyColumns({ isAdmin, onUpdate, onRemove });

	const table = useReactTable({
		data: entries,
		columns,
		state: { sorting, globalFilter },
		initialState: {
			pagination: { pageIndex: 0, pageSize: DEFAULT_PAGE_SIZE }
		},
		onSortingChange: setSorting,
		onGlobalFilterChange: setGlobalFilter,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel()
	});

	const filteredCount = table.getFilteredRowModel().rows.length;

	const prevCountRef = useRef(entries.length);
	useEffect(() => {
		if (entries.length > prevCountRef.current) {
			const lastPage = Math.max(0, table.getPageCount() - 1);
			table.setPageIndex(lastPage);
		}
		prevCountRef.current = entries.length;
	}, [entries.length, table]);

	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center gap-3">
				<div className="relative">
					<input
						ref={filterInputRef}
						type="text"
						placeholder="Filter…"
						value={globalFilter}
						onChange={e => setGlobalFilter(e.target.value)}
						onFocus={filterHelper.onFocus}
						onBlur={filterHelper.onBlur}
						className="rounded border px-3 py-1 text-sm"
					/>
					{filterHelper.isOpen && <PolishLettersPopover onPick={filterHelper.insertChar} />}
				</div>
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

			<p className="text-xs opacity-60">
				quantity: {entries.length}
				{globalFilter !== "" && ` / filtered: ${filteredCount}`}
			</p>

			{filteredCount > 0 && <VocabularyPagination table={table} />}

			<table className="w-full table-fixed border-collapse text-sm">
				<thead>
					{table.getHeaderGroups().map(hg => (
						<tr key={hg.id} className="border-b text-left">
							{hg.headers.map(h => {
								const canSort = h.column.getCanSort();
								const sorted = h.column.getIsSorted();
								const isActions = h.column.id === "actions";
								return (
									<th
										key={h.id}
										className={`px-2 py-2 font-medium ${isActions ? "w-10" : ""}`}
									>
										{h.isPlaceholder ? null : (
											<button
												type="button"
												onClick={h.column.getToggleSortingHandler()}
												disabled={!canSort}
												className="flex items-center gap-1"
											>
												{flexRender(h.column.columnDef.header, h.getContext())}
												{canSort && (
													<span className="inline-flex h-3 w-3 items-center justify-center">
														{sorted === "asc" && <ChevronUp className="h-3 w-3" />}
														{sorted === "desc" && <ChevronDown className="h-3 w-3" />}
													</span>
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
					{table.getRowModel().rows.map(row => (
						<tr key={row.id} className="border-b last:border-b-0">
							{row.getVisibleCells().map(cell => (
								<td key={cell.id} className="px-2 py-1">
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</td>
							))}
						</tr>
					))}
					{filteredCount === 0 && (
						<tr>
							<td colSpan={columns.length} className="px-2 py-6 text-center opacity-60">
								No entries.
							</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	);
}
