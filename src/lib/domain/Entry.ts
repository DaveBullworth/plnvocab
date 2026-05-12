import type { Lng } from "./Lng";

export interface Entry {
  id: string;
  origin: string;
  ru: string;
  isWord: boolean;
  lng: Lng;
  createdAt: number;
  updatedAt: number;
}
