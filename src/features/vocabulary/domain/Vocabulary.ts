import type { Entry } from "./Entry";

export interface Vocabulary {
	version: number;
	updatedAt: string;
	entries: Entry[];
}
