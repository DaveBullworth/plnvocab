import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { getAdminFromCookies } from "@/lib/auth/session";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await getAdminFromCookies()) {
    redirect("/");
  }
  const { error } = await searchParams;
  const isInvalid = error === "invalid";

  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <LoginForm isInvalid={isInvalid} />
    </main>
  );
}
