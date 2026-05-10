"use client";

import { useState, type RefObject } from "react";

const PL_LETTERS = ["ą", "ć", "ę", "ł", "ń", "ó", "ś", "ź", "ż"] as const;

export function usePolishLetters({
	inputRef,
	value,
	onChange,
	maxLength
}: {
	inputRef: RefObject<HTMLInputElement | null>;
	value: string;
	onChange: (next: string) => void;
	maxLength?: number;
}) {
	const [isOpen, setIsOpen] = useState(false);

	const insertChar = (ch: string) => {
		const input = inputRef.current;
		if (!input) return;
		const start = input.selectionStart ?? value.length;
		const end = input.selectionEnd ?? value.length;
		const next = value.slice(0, start) + ch + value.slice(end);
		if (maxLength !== undefined && next.length > maxLength) return;
		onChange(next);
		requestAnimationFrame(() => {
			input.focus();
			const caret = start + ch.length;
			input.setSelectionRange(caret, caret);
		});
	};

	return {
		isOpen,
		onFocus: () => setIsOpen(true),
		onBlur: () => setIsOpen(false),
		insertChar
	};
}

export function PolishLettersPopover({
	onPick,
	align = "left"
}: {
	onPick: (ch: string) => void;
	align?: "left" | "center";
}) {
	const position = align === "center" ? "left-1/2 -translate-x-1/2" : "left-0";
	return (
		<div
			className={`absolute ${position} top-full z-20 mt-1 flex gap-1 rounded border bg-[var(--background)] p-1 shadow`}
		>
			{PL_LETTERS.map(ch => (
				<button
					key={ch}
					type="button"
					tabIndex={-1}
					onMouseDown={e => e.preventDefault()}
					onClick={() => onPick(ch)}
					className="rounded px-1.5 py-0.5 text-sm hover:bg-black/5 dark:hover:bg-white/10"
				>
					{ch}
				</button>
			))}
		</div>
	);
}
