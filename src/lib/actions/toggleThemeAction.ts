"use server";

import { cookies } from "next/headers";
import { THEME_COOKIE } from "@/lib/theme/themeCookie";

const MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 1 year

export async function toggleThemeAction(): Promise<void> {
  const c = await cookies();
  const isDark = c.get(THEME_COOKIE)?.value === "dark";
  c.set(THEME_COOKIE, isDark ? "light" : "dark", {
    path: "/",
    maxAge: MAX_AGE_SECONDS,
    sameSite: "lax",
  });
}
