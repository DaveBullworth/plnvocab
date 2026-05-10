"use client";

import { useRef, useState } from "react";
import { PolishLettersPopover, usePolishLetters } from "@/components/common/PolishLetters";

export function EditableCell({
	value,
	onCommit,
	placeholder,
	polishHelper = false
}: {
	value: string;
	onCommit: (next: string) => void;
	placeholder?: string;
	polishHelper?: boolean;
}) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [local, setLocal] = useState(value);
	const [prevValue, setPrevValue] = useState(value);
	const helper = usePolishLetters({ inputRef, value: local, onChange: setLocal });

	if (value !== prevValue) {
		setPrevValue(value);
		setLocal(value);
	}

	return (
		<div className="relative">
			<input
				ref={inputRef}
				type="text"
				value={local}
				placeholder={placeholder}
				onChange={e => setLocal(e.target.value)}
				onFocus={helper.onFocus}
				onBlur={() => {
					helper.onBlur();
					if (local !== value) onCommit(local);
				}}
				className="w-full bg-transparent px-1 py-0.5 outline-none focus:ring-1 focus:ring-blue-400"
			/>
			{polishHelper && helper.isOpen && <PolishLettersPopover onPick={helper.insertChar} />}
		</div>
	);
}
