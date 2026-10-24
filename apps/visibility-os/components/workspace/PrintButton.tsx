"use client";

import { Button } from "@/components/ui";

/** Opens the browser's print dialog, where "Save as PDF" is one of the choices. */
export default function PrintButton() {
  return (
    <Button variant="secondary" className="ws-no-print" onClick={() => window.print()}>
      Print or save as PDF
    </Button>
  );
}
