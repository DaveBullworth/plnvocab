"use server";

import { redirect } from "next/navigation";
import { setAdminCookie } from "@/lib/auth/session";

export async function loginAction(formData: FormData): Promise<void> {
  const expected = process.env.ADMIN_SECRET;
  if (!expected) {
    throw new Error("ADMIN_SECRET is not set");
  }
  const provided = formData.get("secret");
  if (typeof provided !== "string" || provided !== expected) {
    redirect("/login?error=invalid");
  }
  await setAdminCookie();
  redirect("/");
}
