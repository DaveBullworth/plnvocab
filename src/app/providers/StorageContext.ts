import { createContext } from "react";
// ↑ импортируем функцию createContext из React
//   это обычная функция, не компонент

import type { VocabularyStorage } from "@/infrastructure/storage/VocabularyStorage";
// ↑ импортируем ТОЛЬКО ТИП (TypeScript)
//   в runtime этого импорта не будет
//   он нужен, чтобы описать, КАКОЕ значение
//   будет храниться внутри контекста

/**
 * StorageContext — это ПЕРЕМЕННАЯ
 *
 * Это объект, созданный функцией createContext
 */
export const StorageContext = createContext<VocabularyStorage | null>(null);
/*
	Разбираем по частям:

	1) createContext<...>()
	   ↑ обычный вызов функции

	2) <VocabularyStorage | null>
	   ↑ это TypeScript-обобщение (generic)
	   ↑ оно говорит:
	     "значение, которое будет храниться в этом контексте,
	      имеет тип VocabularyStorage ИЛИ null"

	   это тип ЗНАЧЕНИЯ, которое потом вернёт useContext

	3) (null)
	   ↑ значение по умолчанию
	   ↑ его получит useContext(StorageContext),
	     если Provider не был подключён

	4) результат createContext(...)
	   ↑ это ОБЪЕКТ примерно такого вида:
	     {
	       Provider: функция-компонент,
	       Consumer: функция-компонент,
	       ...
	     }

	5) StorageContext — это ссылка на этот объект
*/
