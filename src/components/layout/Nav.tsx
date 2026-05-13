"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Upload } from "lucide-react";
import { LANGUAGES, LANGUAGE_LABELS, type Lng } from "@/lib/domain/Lng";
import { ThemeToggle } from "./ThemeToggle";
import { ExportButton } from "@/components/io/ExportButton";
import { ImportDialog } from "@/components/io/ImportDialog";

const SECTIONS = [
  { slug: "words", label: "Words" },
  { slug: "phrases", label: "Phrases" },
  { slug: "tester", label: "Tester" },
] as const;

type Section = (typeof SECTIONS)[number]["slug"];

function currentSection(pathname: string): Section {
  const seg = pathname.split("/")[2];
  return SECTIONS.some((s) => s.slug === seg) ? (seg as Section) : "words";
}

export function Nav({ lng }: { lng: Lng }) {
  const pathname = usePathname();
  const section = currentSection(pathname);
  const [importOpen, setImportOpen] = useState(false);

  return (
    <>
      <nav className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-black/10 px-4 py-3 dark:border-white/10">
        <div className="flex gap-1">
          {LANGUAGES.map((l) => {
            const active = l === lng;
            return (
              <Link
                key={l}
                href={`/${l}/${section}`}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "rounded px-2 py-1 text-sm transition",
                  active
                    ? "bg-foreground text-background"
                    : "opacity-70 hover:opacity-100",
                )}
              >
                {LANGUAGE_LABELS[l]}
              </Link>
            );
          })}
        </div>

        <div className="flex gap-4">
          {SECTIONS.map((s) => {
            const active = s.slug === section;
            return (
              <Link
                key={s.slug}
                href={`/${lng}/${s.slug}`}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "text-sm transition",
                  active
                    ? "font-semibold underline underline-offset-4"
                    : "opacity-70 hover:opacity-100",
                )}
              >
                {s.label}
              </Link>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setImportOpen(true)}
            aria-label="Import vocabulary"
            title="Import"
            className="rounded p-1 opacity-70 hover:opacity-100"
          >
            <Upload className="h-4 w-4" />
          </button>
          <ExportButton />
          <ThemeToggle />
        </div>
      </nav>
      {importOpen && <ImportDialog onClose={() => setImportOpen(false)} />}
    </>
  );
}
