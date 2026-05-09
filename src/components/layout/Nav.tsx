"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useIsAdmin } from "@/components/auth/AdminProvider";
import { logoutAction } from "@/lib/actions/logoutAction";

const links = [
  { href: "/words", label: "Words" },
  { href: "/phrases", label: "Phrases" },
  { href: "/tester", label: "Tester" },
];

export function Nav() {
  const pathname = usePathname();
  const isAdmin = useIsAdmin();

  return (
    <nav className="flex items-center justify-between border-b px-4 py-3">
      <div className="flex items-center gap-6">
        <span className="font-semibold">plnvocab</span>
        <ul className="flex gap-4">
          {links.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={clsx(
                    "text-sm",
                    active
                      ? "font-semibold underline"
                      : "opacity-70 hover:opacity-100",
                  )}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="flex items-center gap-3 text-sm">
        {isAdmin ? (
          <form action={logoutAction}>
            <button
              type="submit"
              className="opacity-70 hover:opacity-100"
            >
              Logout
            </button>
          </form>
        ) : (
          <Link
            href="/login"
            className="opacity-70 hover:opacity-100"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
