import { isFuture, type Day, type HabitId } from "@habit/core";
import { useEntries, useHabit, useHabits } from "@habit/data";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { HabitIcon } from "@/components/habit-icon";
import { formatDayRelative } from "@/components/format";
import { ResponsiveSheet } from "@/components/sheet";
import { parseEntryRef, useCloseSheet, useSheetSearch } from "@/components/sheet-search";
import { useIsWide } from "@/components/use-media-query";
import { useRetained } from "@/components/use-retained";
import { NumberInput } from "@/features/entry-input/number-input";
import { OptionInput } from "@/features/entry-input/option-input";
import { TextInput } from "@/features/entry-input/text-input";
import { useToday } from "@/features/list/use-today";

/**
 * The input of a value (`?entry=<habitId>:<day>`): a small bottom sheet on a phone, a popover at
 * the square on a desktop. Every change applies at once; there is no save button.
 */
export function EntryInputSheet() {
  const { entry } = useSheetSearch();
  const shown = useRetained(entry);
  const ref = shown === undefined ? null : parseEntryRef(shown);
  if (ref === null) return null;
  return (
    <EntryInput
      key={shown}
      entry={shown!}
      habitId={ref.habitId}
      day={ref.day}
      open={entry !== undefined}
    />
  );
}

function EntryInput({
  entry,
  habitId,
  day,
  open,
}: {
  entry: string;
  habitId: HabitId;
  day: Day;
  open: boolean;
}) {
  const closeSheet = useCloseSheet();
  const habit = useHabit(habitId);
  const { source } = useHabits();
  const value = useEntries()(habitId, day);
  const today = useToday();
  const wide = useIsWide();
  const field = useRef<HTMLElement>(null);
  // The square this input is about, for the desktop popover: the list and the habit page mark
  // their squares with `data-entry`. Read when the input mounts for this entry, and once more
  // after that first commit: after a reload with `?entry`, the input and the screen under it
  // mount together, so the square is not in the document yet while they render.
  const [anchor, setAnchor] = useState(() => findSquare(entry));
  useLayoutEffect(() => {
    if (anchor === null) setAnchor(findSquare(entry));
    // Only at mount: a square that comes later must not turn an open dialog into a popover.
  }, []);

  const usable =
    habit !== undefined &&
    habit.deletedAt === undefined &&
    habit.kind !== "check" &&
    !isFuture(day, today);

  // A link to a habit that does not exist (or to a future Day) closes once the data is known.
  useEffect(() => {
    if (open && source !== "none" && !usable) closeSheet();
  }, [closeSheet, open, source, usable]);

  if (!usable) return null;

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={(next) => {
        if (!next) closeSheet();
      }}
      title={
        <span className="flex min-w-0 items-center gap-2.5">
          <HabitIcon icon={habit.icon} color={habit.color} size="1.25rem" />
          <span className="truncate" dir="auto">
            {habit.name}
          </span>
        </span>
      }
      description={formatDayRelative(day, today)}
      desktop="popover"
      anchor={anchor}
      // Text is for typing, so its field takes the focus. A number takes it only with a mouse or
      // a keyboard: on a phone it opens without the keyboard, for the buttons.
      initialFocus={(type) =>
        habit.kind === "text" || (habit.kind === "number" && wide && type !== "touch")
          ? field.current
          : true
      }
    >
      {habit.kind === "number" ? (
        <NumberInput habit={habit} day={day} value={value} fieldRef={field} />
      ) : habit.kind === "text" ? (
        <TextInput habit={habit} day={day} value={value} fieldRef={field} />
      ) : (
        <OptionInput habit={habit} day={day} value={value} onDone={closeSheet} />
      )}
    </ResponsiveSheet>
  );
}

function findSquare(entry: string): Element | null {
  return document.querySelector(`[data-entry="${CSS.escape(entry)}"]`);
}
