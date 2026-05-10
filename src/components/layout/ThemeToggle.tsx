import { Moon, Sun } from "lucide-react";
import { toggleThemeAction } from "@/lib/actions/toggleThemeAction";

export function ThemeToggle({ isDark }: { isDark: boolean }) {
	return (
		<form action={toggleThemeAction}>
			<button
				type="submit"
				aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
				className="flex items-center opacity-70 hover:opacity-100"
			>
				{isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
			</button>
		</form>
	);
}

