import { useState, useEffect, useCallback } from "react";
import { loadVocabulary } from "@/features/vocabulary/application/loadVocabulary";
import { saveVocabulary } from "@/features/vocabulary/application/saveVocabulary";
import type { VocabularyStorage } from "@/infrastructure/storage/VocabularyStorage";
import { LocalDraftStorage } from "@/infrastructure/storage/LocalDraftStorage";
import type { Vocabulary } from "../domain/Vocabulary";
import type { Entry, EntryId } from "../domain/Entry";

/**
 * useVocabulary
 *
 * Центральный application-хук для работы со словарём.
 * Работает ТОЛЬКО с абстракцией VocabularyStorage.
 */
export function useVocabulary(storage: VocabularyStorage) {
	// -----------------------
	// 1️⃣ Состояние
	// -----------------------

	const [vocabulary, setVocabulary] = useState<Vocabulary | null>(null);
	const [isDirty, setIsDirty] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<unknown>(null);

	// -----------------------
	// 2️⃣ Инициализация (load)
	// -----------------------

	useEffect(() => {
		let cancelled = false;

		async function init() {
			try {
				// 1. Проверяем draft
				const draft = LocalDraftStorage.load();
				if (draft) {
					if (!cancelled) {
						setVocabulary(draft);
						setIsDirty(true); // draft = несохранённые изменения
					}
					return;
				}

				// 2. Загружаем из постоянного storage
				const load = loadVocabulary(storage);
				const loaded = await load();

				if (!cancelled) {
					setVocabulary(loaded);
				}
			} catch (e) {
				if (!cancelled) setError(e);
			} finally {
				if (!cancelled) setIsLoading(false);
			}
		}

		init();

		return () => {
			cancelled = true;
		};
	}, [storage]);

	// -----------------------
	// 3️⃣ Редактирование записи
	// -----------------------

	const updateEntry = useCallback((id: EntryId, patch: Partial<Entry>) => {
		setVocabulary(prev => {
			if (!prev) return prev;

			return {
				...prev,
				entries: prev.entries.map(e => (e.id === id ? { ...e, ...patch } : e))
			};
		});

		setIsDirty(true);
	}, []);

	// -----------------------
	// 4️⃣ Добавление записи
	// -----------------------

	const addEntry = useCallback((entry: Entry) => {
		setVocabulary(prev => {
			if (!prev) return prev;

			return {
				...prev,
				entries: [...prev.entries, entry]
			};
		});

		setIsDirty(true);
	}, []);

	// -----------------------
	// 5️⃣ Удаление записи
	// -----------------------

	const removeEntry = useCallback((id: EntryId) => {
		setVocabulary(prev => {
			if (!prev) return prev;

			return {
				...prev,
				entries: prev.entries.filter(e => e.id !== id)
			};
		});

		setIsDirty(true);
	}, []);

	// -----------------------
	// 6️⃣ Автосохранение draft
	// -----------------------

	useEffect(() => {
		if (vocabulary && isDirty) {
			LocalDraftStorage.save(vocabulary);
		}
	}, [vocabulary, isDirty]);

	// -----------------------
	// 7️⃣ Явное сохранение
	// -----------------------

	const save = useCallback(async () => {
		if (!vocabulary) return;

		const save = saveVocabulary(storage);
		await save(vocabulary);

		LocalDraftStorage.clear();
		setIsDirty(false);
	}, [vocabulary, storage]);

	// -----------------------
	// 8️⃣ API для UI
	// -----------------------

	return {
		vocabulary,
		isDirty,
		isLoading,
		error,

		updateEntry,
		addEntry,
		removeEntry,
		save
	};
}
