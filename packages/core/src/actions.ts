import type { Day } from "./day";
import type { Entry, EntryKey, EntryValue } from "./entry";
import type { Habit, HabitPatch } from "./habit";
import type { HabitId } from "./ids";
import { notImplemented } from "./internal";

/**
 * Every change that the person makes is one Action. Writes are idempotent: they carry the new
 * value, never a toggle (ADR 0002). Each Action has an inverse, which undo uses.
 */
export type Action =
  | { type: "setEntry"; habitId: HabitId; day: Day; value: EntryValue }
  | { type: "clearEntry"; habitId: HabitId; day: Day }
  | { type: "createHabit"; habit: Habit }
  | { type: "updateHabit"; id: HabitId; patch: HabitPatch }
  | { type: "moveHabit"; id: HabitId; order: string }
  | { type: "deleteHabit"; id: HabitId }
  | { type: "restoreHabit"; id: HabitId }
  | { type: "batch"; actions: Action[] };

/** The client's copy of the data: all Habits (also deleted ones) and the Entries it holds. */
export interface HabitState {
  habits: Record<HabitId, Habit>;
  entries: Record<EntryKey, Entry>;
}

export function emptyState(): HabitState {
  return { habits: {}, entries: {} };
}

/**
 * The state after `action`. Pure: it never changes `state`. `now` becomes the `updatedAt` of each
 * changed row (and the `deletedAt` of a delete or a clear). The backend and the optimistic update
 * use this same function, so the client and the server agree.
 */
export function applyAction(state: HabitState, action: Action, now: number): HabitState {
  return notImplemented(`applyAction(${action.type}, ${Object.keys(state.habits).length}, ${now})`);
}

/**
 * The Action that undoes `action`, computed from the state BEFORE `action`. For example, the
 * inverse of a setEntry over an existing Entry is a setEntry with the old value, and over no Entry
 * it is a clearEntry. The inverse of a batch is the batch of inverses in reverse order.
 */
export function invertAction(state: HabitState, action: Action): Action {
  return notImplemented(`invertAction(${action.type}, ${Object.keys(state.habits).length})`);
}

/** The Habits that are not deleted, sorted by `order`. */
export function visibleHabits(state: HabitState): Habit[] {
  return notImplemented(`visibleHabits(${Object.keys(state.habits).length})`);
}

/** The value of the Entry of a Habit on a Day, or undefined when there is no Entry (or a cleared one). */
export function entryValue(state: HabitState, habitId: HabitId, day: Day): EntryValue | undefined {
  return notImplemented(`entryValue(${Object.keys(state.entries).length}, ${habitId}, ${day})`);
}
