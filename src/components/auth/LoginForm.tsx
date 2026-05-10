"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { loginAction } from "@/lib/actions/loginAction";

export function LoginForm({ isInvalid }: { isInvalid: boolean }) {
  const [show, setShow] = useState(false);

  return (
    <form
      action={loginAction}
      className="flex w-full max-w-sm flex-col gap-3"
    >
      <h1 className="text-xl font-semibold">Admin login</h1>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          name="secret"
          placeholder="Admin secret"
          required
          autoFocus
          className="w-full rounded border px-3 py-2 pr-10"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 flex items-center px-2 opacity-60 hover:opacity-100"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
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
  );
}
