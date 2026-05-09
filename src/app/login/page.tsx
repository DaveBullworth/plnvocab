import { redirect } from "next/navigation";
import { loginAction } from "@/lib/actions/loginAction";
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
      <form
        action={loginAction}
        className="flex w-full max-w-sm flex-col gap-3"
      >
        <h1 className="text-xl font-semibold">Admin login</h1>
        <input
          type="password"
          name="secret"
          placeholder="Admin secret"
          required
          autoFocus
          className="rounded border px-3 py-2"
        />
        {isInvalid && (
          <p className="text-sm text-red-600">Wrong secret. Try again.</p>
        )}
        <button
          type="submit"
          className="rounded bg-black px-3 py-2 text-white"
        >
          Sign in
        </button>
      </form>
    </main>
  );
}
