import { ResponsiveSheet } from "@/components/sheet";
import { parseEntryRef, useCloseSheet, useSheetSearch } from "@/components/sheet-search";
import { useRetained } from "@/components/use-retained";

/**
 * The input of a value (`?entry=<habitId>:<day>`): a small bottom sheet on a phone, a popover at
 * the square on a desktop.
 */
export function EntryInputSheet() {
  const { entry } = useSheetSearch();
  const closeSheet = useCloseSheet();
  const shown = useRetained(entry);
  const ref = shown === undefined ? null : parseEntryRef(shown);
  if (ref === null) return null;
  return (
    <ResponsiveSheet
      open={entry !== undefined}
      onOpenChange={(open) => {
        if (!open) closeSheet();
      }}
      title={ref.day}
      desktop="popover"
      anchor={document.querySelector(`[data-entry="${CSS.escape(shown!)}"]`)}
    >
      {null}
    </ResponsiveSheet>
  );
}
