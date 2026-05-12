import Dexie, { type Table } from "dexie";
import type { Entry } from "@/lib/domain/Entry";

class VocabDB extends Dexie {
  entries!: Table<Entry, string>;

  constructor() {
    super("plnvocab");
    this.version(1).stores({
      entries: "id, lng, updatedAt",
    });
  }
}

export const db = new VocabDB();
