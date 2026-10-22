import type { Day } from "./day";
import type { HabitId, OptionId } from "./ids";

/** The value of an Entry. Its `kind` is always the Kind of its Habit. */
export type EntryValue =
  | { kind: "check" }
  | { kind: "number"; value: number }
  | { kind: "choice"; optionId: OptionId }
  | { kind: "scale"; optionId: OptionId }
  | { kind: "text"; text: string };

/** The value of one Habit on one Day. A Habit has a maximum of one Entry for each Day. */
export interface Entry {
  habitId: HabitId;
  day: Day;
  value: EntryValue;
  updatedAt: number;
  /** A cleared Entry stays as a tombstone, so that the clear syncs (ADR 0002). */
  deletedAt?: number;
}

/** The key of an Entry in maps: `${habitId}:${day}`. */
export type EntryKey = `${string}:${string}`;

export function entryKey(habitId: HabitId, day: Day): EntryKey {
  return `${habitId}:${day}`;
}
