import type { EntryValue } from "./entry";
import type { Habit } from "./habit";
import { notImplemented } from "./internal";

/**
 * How much of the square of a Day is filled, from 0 (no Entry: empty) to 1 (full).
 *
 * - check: 1 when the Entry exists.
 * - number: value / target, at most 1. Without a target, 1 for any value above 0. 0 for 0.
 * - choice: 1.
 * - scale: (position + 1) / count of Options, so the first Option is the lightest and the last is
 *   full. A retired Option keeps its position.
 * - text: 1 when the text is not empty after trimming, else 0.
 *
 * The Direction never changes the Intensity.
 */
export function intensity(habit: Habit, value: EntryValue | undefined): number {
  return notImplemented(`intensity(${habit.kind}, ${value?.kind})`);
}
