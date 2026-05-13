"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { ExportConfirmDialog } from "./ExportConfirmDialog";

export function ExportButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Export vocabulary"
        title="Export"
        className="rounded p-1 opacity-70 hover:opacity-100"
      >
        <Download className="h-4 w-4" />
      </button>
      {open && <ExportConfirmDialog onClose={() => setOpen(false)} />}
    </>
  );
}
