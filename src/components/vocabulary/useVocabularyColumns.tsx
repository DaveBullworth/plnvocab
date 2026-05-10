"use client";

import type { ColumnDef, Row, SortingFn } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { useMemo } from "react";
import type { Entry } from "@/lib/domain/Entry";
import { EditableCell } from "./EditableCell";

const plCollator = new Intl.Collator("pl");
const ruCollator = new Intl.Collator("ru");

const makeLocaleSort =
	(collator: Intl.Collator): SortingFn<Entry> =>
	(a: Row<Entry>, b: Row<Entry>, columnId: string) =>
		collator.compare(String(a.getValue(columnId) ?? ""), String(b.getValue(columnId) ?? ""));

export function useVocabularyColumns({
	isAdmin,
	onUpdate,
	onRemove
}: {
	isAdmin: boolean;
	onUpdate: (id: string, patch: Partial<Entry>) => void;
	onRemove: (id: string) => void;
}): ColumnDef<Entry>[] {
	return useMemo<ColumnDef<Entry>[]>(() => {
		const cols: ColumnDef<Entry>[] = [
			{
				accessorKey: "pl",
				header: "Polish",
				sortingFn: makeLocaleSort(plCollator),
				cell: ({ row }) =>
					isAdmin ? (
						<EditableCell
							value={row.original.pl}
							placeholder="po polsku"
							polishHelper
							onCommit={v => onUpdate(row.original.id, { pl: v })}
						/>
					) : (
						<span>{row.original.pl}</span>
					)
			},
			{
				accessorKey: "ru",
				header: "Russian",
				sortingFn: makeLocaleSort(ruCollator),
				cell: ({ row }) =>
					isAdmin ? (
						<EditableCell
							value={row.original.ru}
							placeholder="по-русски"
							onCommit={v => onUpdate(row.original.id, { ru: v })}
						/>
					) : (
						<span>{row.original.ru}</span>
					)
			}
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
				)
			});
		}
		return cols;
	}, [isAdmin, onUpdate, onRemove]);
}
