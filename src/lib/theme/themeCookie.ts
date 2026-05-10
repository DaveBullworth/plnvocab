import "server-only";
import { cookies } from "next/headers";

export const THEME_COOKIE = "plnvocab_theme";
export type Theme = "light" | "dark";

export async function getThemeFromCookies(): Promise<Theme> {
  const c = await cookies();
  return c.get(THEME_COOKIE)?.value === "dark" ? "dark" : "light";
}
