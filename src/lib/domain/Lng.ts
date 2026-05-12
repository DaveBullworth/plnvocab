export type Lng = "pl" | "en";

export const LANGUAGES: readonly Lng[] = ["pl", "en"] as const;

export const LANGUAGE_LABELS: Record<Lng, string> = {
  pl: "Polish",
  en: "English",
};

export function isLng(value: unknown): value is Lng {
  return value === "pl" || value === "en";
}
