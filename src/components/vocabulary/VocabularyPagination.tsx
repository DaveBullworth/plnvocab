"use client";

import type { Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const;
export const DEFAULT_PAGE_SIZE = 10;

export function VocabularyPagination<TData>({ table }: { table: Table<TData> }) {
	const { pageIndex, pageSize } = table.getState().pagination;
	const pageCount = table.getPageCount();

	return (
		<div className="flex flex-wrap items-center justify-between gap-3 text-sm">
			<label className="flex items-center gap-2">
				<span className="opacity-70">Per page</span>
				<select
					value={pageSize}
					onChange={e => table.setPageSize(Number(e.target.value))}
					className="rounded border bg-transparent px-2 py-1"
				>
					{PAGE_SIZE_OPTIONS.map(n => (
						<option key={n} value={n}>
							{n}
						</option>
					))}
				</select>
			</label>

			<div className="flex items-center gap-2">
				<button
					type="button"
					onClick={() => table.previousPage()}
					disabled={!table.getCanPreviousPage()}
					aria-label="Previous page"
					className="rounded border px-2 py-1 disabled:opacity-40"
				>
					<ChevronLeft className="h-4 w-4" />
				</button>
				<span className="opacity-70">
					Page {pageIndex + 1} of {Math.max(1, pageCount)}
				</span>
				<button
					type="button"
					onClick={() => table.nextPage()}
					disabled={!table.getCanNextPage()}
					aria-label="Next page"
					className="rounded border px-2 py-1 disabled:opacity-40"
				>
					<ChevronRight className="h-4 w-4" />
				</button>
			</div>
		</div>
	);
}
