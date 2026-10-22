import type { Action } from "./actions";
import { isFuture, type Day } from "./day";
import type { EntryValue } from "./entry";
import type { Habit } from "./habit";
import type { HabitId } from "./ids";

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
  if (isFuture(day, today)) return { type: "locked" };
  const habitId = habit.id;
  switch (habit.kind) {
    case "check":
      return {
        type: "action",
        action:
          current === undefined
            ? { type: "setEntry", habitId, day, value: { kind: "check" } }
            : { type: "clearEntry", habitId, day },
      };
    case "number": {
      const value = current?.kind === "number" ? current.value : 0;
      return {
        type: "action",
        action: {
          type: "setEntry",
          habitId,
          day,
          value: { kind: "number", value: addDecimals(value, habit.step) },
        },
      };
    }
    case "choice":
    case "scale":
    case "text":
      return { type: "openInput" };
  }
}

/** `a + b` without the binary rounding error, so 0.2 + 0.1 is 0.3 and not 0.30000000000000004. */
function addDecimals(a: number, b: number): number {
  const sum = a + b;
  const places = Math.max(decimalPlaces(a), decimalPlaces(b));
  // toFixed takes a maximum of 100 places; a number that small keeps the plain sum.
  return places === 0 || places > 100 ? sum : Number(sum.toFixed(places));
}

/** The count of digits after the point, also for a number in exponent notation such as 1e-7. */
function decimalPlaces(value: number): number {
  const [mantissa = "", exponent = "0"] = String(value).split("e");
  const fraction = mantissa.split(".")[1]?.length ?? 0;
  return Math.max(0, fraction - Number(exponent));
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
  if (habit.kind !== "check") return { type: "batch", actions: [] };
  const habitId = habit.id;
  const actions: Action[] = [];
  for (const day of new Set(days)) {
    if (isFuture(day, today)) continue;
    const alreadyPainted =
      current !== undefined && (current(habitId, day) !== undefined) === (mode === "set");
    if (alreadyPainted) continue;
    actions.push(
      mode === "set"
        ? { type: "setEntry", habitId, day, value: { kind: "check" } }
        : { type: "clearEntry", habitId, day },
    );
  }
  return { type: "batch", actions };
}
