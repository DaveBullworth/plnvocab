import type { ReactNode } from "react";
// ↑ ReactNode — это TypeScript-тип
//   означает "любой JSX, который можно отрендерить"
//   (элементы, строки, массивы и т.п.)

import { StorageContext } from "./StorageContext";
// ↑ импортируем объект контекста,
//   который мы создали в StorageContext.ts

import { GitHubStorage } from "@/infrastructure/storage/GitHubStorage";
// ↑ импортируем КЛАСС
//   это обычный TS класс, не React

/**
 * StorageProvider — это ФУНКЦИЯ-КОМПОНЕНТ React
 *
 * Она:
 * - принимает props
 * - возвращает JSX
 */
export function StorageProvider({ children }: { children: ReactNode }) {
	/*
		children — это:
		<StorageProvider>
			<App />
		</StorageProvider>

		т.е. всё, что передали между тегами
	*/

	/**
	 * storage — это ОБЫЧНАЯ ПЕРЕМЕННАЯ
	 *
	 * В неё мы кладём РЕЗУЛЬТАТ вызова конструктора класса
	 */
	const storage = new GitHubStorage(
		// ↓ значения берутся из import.meta.env
		//   это НЕ process.env
		//   это объект, который Vite подставляет
		//   во время сборки проекта

		import.meta.env.VITE_GITHUB_REPO_URL,
		import.meta.env.VITE_GITHUB_TOKEN
	);

	/*
		import.meta.env:
		- доступен только в Vite
		- содержит переменные из .env файлов
		- ТОЛЬКО те, что начинаются с VITE_
	*/

	/**
	 * Возвращаем JSX
	 *
	 * <StorageContext.Provider> — это компонент,
	 * который находится внутри объекта StorageContext
	 */
	return <StorageContext.Provider value={storage}>{children}</StorageContext.Provider>;

	/*
		Что происходит тут буквально:

		1) React видит Provider
		2) React запоминает:
		   "для всех компонентов внутри
		    StorageContext = storage"
		3) Любой useContext(StorageContext)
		   ниже по дереву получит именно этот storage
	*/
}
