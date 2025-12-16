import { useContext } from "react";
import type { VocabularyStorage } from "@/infrastructure/storage/VocabularyStorage";
import { StorageContext } from "@/app/providers/StorageContext";

/**
 * Хелпер-хук для получения storage из DI-контейнера
 *
 * Это просто "достань зависимость".
 */
export function useStorage(): VocabularyStorage {
	/**
	 * useContext читает значение,
	 * которое положил ближайший StorageProvider
	 */
	const context = useContext(StorageContext);

	/**
	 * Защитная проверка:
	 * если Provider забыли подключить —
	 * мы упадём сразу, а не молча
	 */
	if (!context) {
		throw new Error("useStorage must be used inside StorageProvider");
	}

	/**
	 * Возвращаем гарантированно НЕ null
	 * и типизированный VocabularyStorage
	 */
	return context;
}
