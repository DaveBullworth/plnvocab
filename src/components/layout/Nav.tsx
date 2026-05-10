"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { LogIn, LogOut } from "lucide-react";
import { useIsAdmin } from "@/components/auth/AdminProvider";
import { logoutAction } from "@/lib/actions/logoutAction";
import { ThemeToggle } from "./ThemeToggle";

const links = [
	{ href: "/words", label: "Words" },
	{ href: "/phrases", label: "Phrases" },
	{ href: "/tester", label: "Tester" }
];

export function Nav({ isDark }: { isDark: boolean }) {
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
										active ? "font-semibold underline" : "opacity-70 hover:opacity-100"
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
				<ThemeToggle isDark={isDark} />
				{isAdmin ? (
					<form action={logoutAction} className="h-[16px]">
						<button type="submit" className="opacity-70 hover:opacity-100">
							<LogOut className="h-4 w-4" />
						</button>
					</form>
				) : (
					<Link href="/login" className="opacity-70 hover:opacity-100">
						<LogIn className="h-4 w-4" />
					</Link>
				)}
			</div>
		</nav>
	);
}

