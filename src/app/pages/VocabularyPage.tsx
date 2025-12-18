import { useState } from "react";
import { Container, Title, SegmentedControl, Stack } from "@mantine/core";
import { useStorage } from "@/features/vocabulary/hooks/useStorage";
import { useVocabulary } from "@/features/vocabulary/hooks/useVocabulary";
import { VocabularyTable } from "@/features/vocabulary/components/VocabularyTable";
// import { SaveBar } from "@/features/vocabulary/components/SaveBar";

/**
 * VocabularyPage
 *
 * Основная страница словаря
 * Отвечает за переключение между Words и Phrases
 * Вызывает useVocabulary и передает данные в таблицу и SaveBar
 */
export function VocabularyPage() {
	// -----------------------
	// #1 Получаем постоянное хранилище
	// -----------------------
	const storage = useStorage(); // возвращает GitHubStorage или любой другой, внедренный через StorageProvider
	const { vocabulary, isLoading, error, updateEntry, addEntry, removeEntry } =
		useVocabulary(storage);

	// -----------------------
	// #2 Состояние переключения: слова / фразы
	// -----------------------
	const [mode, setMode] = useState<"words" | "phrases">("words");

	// -----------------------
	// #3 Рендер
	// -----------------------
	if (isLoading) return <div>Загрузка...</div>;
	if (error) return <div>Ошибка: {(error as Error).message}</div>;
	if (!vocabulary) return null;

	// -----------------------
	// #4 Фильтруем записи по типу
	// -----------------------
	const entries = vocabulary.entries.filter(e => (mode === "words" ? e.isWord : !e.isWord));

	return (
		<Container className="vocabulary-page">
			<Stack gap="md">
				<Title order={1}>Polish Vocabulary</Title>

				<SegmentedControl
					value={mode}
					onChange={value => setMode(value as "words" | "phrases")}
					data={[
						{ label: "Слова", value: "words" },
						{ label: "Фразы", value: "phrases" }
					]}
				/>

				<VocabularyTable
					entries={entries}
					updateEntry={updateEntry}
					removeEntry={removeEntry}
					addEntry={addEntry}
				/>

				{/* <SaveBar isDirty={isDirty} onSave={save} /> */}
			</Stack>
		</Container>
	);
}
