"use server";

import { redirect } from "next/navigation";
import { clearAdminCookie } from "@/lib/auth/session";

export async function logoutAction(): Promise<void> {
  await clearAdminCookie();
  redirect("/");
}
