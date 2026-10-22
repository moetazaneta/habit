import type { Action } from "./actions";
import type { Day } from "./day";
import type { EntryValue } from "./entry";
import type { Habit } from "./habit";
import type { HabitId } from "./ids";
import { notImplemented } from "./internal";

/** What a tap on the square of a Day does. */
export type TapResult =
  | { type: "action"; action: Action }
  /** choice, scale and text Habits open the input (a sheet on a phone, a popover on a desktop). */
  | { type: "openInput" }
  /** A future Day: nothing happens. */
  | { type: "locked" };

/**
 * - check: set the Entry when there is none, clear it when there is one.
 * - number: set the value to current + step (also above the Target).
 * - choice, scale, text: open the input.
 * - a future Day: locked.
 */
export function tapResult(
  habit: Habit,
  day: Day,
  current: EntryValue | undefined,
  today: Day,
): TapResult {
  return notImplemented(`tapResult(${habit.kind}, ${day}, ${current?.kind}, ${today})`);
}

/**
 * The single batch Action of a drag over the squares of a check Habit (drag-to-paint): `mode`
 * comes from the first square (set when it was empty, clear when it was filled). Future Days and
 * Days that already have the target state are skipped.
 *
 * `current` reads the loaded Entries: pass the function that `useEntries` returns. Without it,
 * paintAction cannot see which Days already have the target state, and only skips future Days.
 */
export function paintAction(
  habit: Habit,
  days: Day[],
  mode: "set" | "clear",
  today: Day,
  current?: (habitId: HabitId, day: Day) => EntryValue | undefined,
): Action {
  return notImplemented(
    `paintAction(${habit.kind}, ${days.length}, ${mode}, ${today}, ${typeof current})`,
  );
}
