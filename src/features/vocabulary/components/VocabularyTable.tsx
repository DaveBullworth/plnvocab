import { Table, Button, Group } from "@mantine/core";
import { Plus } from "lucide-react";
import type { Entry, EntryId } from "../domain/Entry";

/**
 * Пропсы таблицы словаря
 * Таблица ничего не знает про storage, draft и GitHub
 * Она работает только с данными и колбэками
 */
type VocabularyTableProps = {
	entries: Entry[];
	addEntry: (entry: Entry) => void;
	updateEntry: (id: EntryId, patch: Partial<Entry>) => void;
	removeEntry: (id: EntryId) => void;
};

/**
 * VocabularyTable
 *
 * Отвечает ТОЛЬКО за отображение списка слов / фраз.
 * Никакой бизнес-логики.
 */
export function VocabularyTable({
	entries
}: // addEntry,
// updateEntry,
// removeEntry
VocabularyTableProps) {
	return (
		<Table striped highlightOnHover withTableBorder>
			<Table.Thead>
				<Table.Tr>
					{/* Первая колонка — служебная */}
					<Table.Th style={{ width: 60 }}>
						<Group justify="center">
							<Button
								size="xs"
								variant="light"
								onClick={() => {
									// пока заглушка
									console.log("add entry");
								}}
							>
								<Plus />
							</Button>
						</Group>
					</Table.Th>

					<Table.Th>Polish</Table.Th>
					<Table.Th>Russian</Table.Th>
				</Table.Tr>
			</Table.Thead>

			<Table.Tbody>
				{entries.map(entry => (
					<Table.Tr key={entry.id}>
						{/* служебная колонка (пока пусто) */}
						<Table.Td />

						<Table.Td>{entry.pl}</Table.Td>
						<Table.Td>{entry.ru}</Table.Td>
					</Table.Tr>
				))}
			</Table.Tbody>
		</Table>
	);
}
