import type { EntryValue } from "./entry";
import type { Habit } from "./habit";

/**
 * How much of the square of a Day is filled, from 0 (no Entry: empty) to 1 (full).
 *
 * - check: 1 when the Entry exists.
 * - number: value / target, at most 1. Without a target, 1 for any value above 0. 0 for 0.
 * - choice: 1.
 * - scale: (position + 1) / count of Options, so the first Option is the lightest and the last is
 *   full. A retired Option keeps its position. An Option that is not in the list counts as the
 *   first one.
 * - text: 1 when the text is not empty after trimming, else 0.
 *
 * The Direction never changes the Intensity. A value of another Kind than the Habit's is 0.
 */
export function intensity(habit: Habit, value: EntryValue | undefined): number {
  if (value === undefined || value.kind !== habit.kind) return 0;
  switch (value.kind) {
    case "check":
    case "choice":
      return 1;
    case "number": {
      if (!(value.value > 0)) return 0;
      const target = habit.kind === "number" ? habit.target : undefined;
      return target !== undefined && target > 0 ? Math.min(value.value / target, 1) : 1;
    }
    case "scale": {
      const options = habit.kind === "scale" ? habit.options : [];
      const position = Math.max(
        options.findIndex((option) => option.id === value.optionId),
        0,
      );
      return (position + 1) / Math.max(options.length, 1);
    }
    case "text":
      return value.text.trim() === "" ? 0 : 1;
  }
}
