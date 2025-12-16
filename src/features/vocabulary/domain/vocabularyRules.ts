import type { Entry } from "./Entry";

export function isValidEntry(entry: Entry): boolean {
	return entry.pl.trim().length > 0 && entry.ru.trim().length > 0;
}
