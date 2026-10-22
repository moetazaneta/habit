import type { Day } from "./day";
import { entryKey, type Entry, type EntryKey, type EntryValue } from "./entry";
import type { Habit, HabitPatch } from "./habit";
import type { HabitId } from "./ids";
import { isEqual } from "./internal";

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
 *
 * An Action that changes nothing returns the same `state` object. These change nothing: an Entry
 * write for a Habit that is unknown or deleted, a value of another Kind than the Habit's, a value
 * that is already there, a clear of a Day without an Entry, a create of an id that exists, and an
 * update, move, delete or restore that leaves each field as it was.
 */
export function applyAction(state: HabitState, action: Action, now: number): HabitState {
  switch (action.type) {
    case "setEntry": {
      const habit = state.habits[action.habitId];
      if (habit === undefined || habit.deletedAt !== undefined) return state;
      if (action.value.kind !== habit.kind) return state;
      if (isEqual(entryValue(state, action.habitId, action.day), action.value)) return state;
      const entry: Entry = {
        habitId: action.habitId,
        day: action.day,
        value: action.value,
        updatedAt: now,
      };
      return withEntry(state, entry);
    }
    case "clearEntry": {
      const habit = state.habits[action.habitId];
      if (habit === undefined || habit.deletedAt !== undefined) return state;
      const entry = state.entries[entryKey(action.habitId, action.day)];
      if (entry === undefined || entry.deletedAt !== undefined) return state;
      return withEntry(state, { ...entry, updatedAt: now, deletedAt: now });
    }
    case "createHabit": {
      if (state.habits[action.habit.id] !== undefined) return state;
      return withHabit(state, { ...action.habit, updatedAt: now });
    }
    case "updateHabit": {
      const habit = state.habits[action.id];
      if (habit === undefined) return state;
      const patched = patchHabit(habit, action.patch);
      if (isEqual(patched, habit)) return state;
      return withHabit(state, { ...patched, updatedAt: now });
    }
    case "moveHabit": {
      const habit = state.habits[action.id];
      if (habit === undefined || habit.order === action.order) return state;
      return withHabit(state, { ...habit, order: action.order, updatedAt: now });
    }
    case "deleteHabit": {
      const habit = state.habits[action.id];
      if (habit === undefined || habit.deletedAt !== undefined) return state;
      return withHabit(state, { ...habit, updatedAt: now, deletedAt: now });
    }
    case "restoreHabit": {
      const habit = state.habits[action.id];
      if (habit === undefined || habit.deletedAt === undefined) return state;
      const restored = { ...habit, updatedAt: now };
      delete restored.deletedAt;
      return withHabit(state, restored);
    }
    case "batch":
      return action.actions.reduce((current, inner) => applyAction(current, inner, now), state);
  }
}

/** The Habit with the fields of the patch. Fields of another Kind are ignored; null removes. */
function patchHabit(habit: Habit, patch: HabitPatch): Habit {
  const next: Habit = { ...habit };
  if (patch.name !== undefined) next.name = patch.name;
  if (patch.description !== undefined) next.description = patch.description;
  if (patch.icon !== undefined) next.icon = patch.icon;
  if (patch.color !== undefined) next.color = patch.color;
  if (patch.direction !== undefined) next.direction = patch.direction;
  if (next.kind === "number") {
    if (patch.unit === null) delete next.unit;
    else if (patch.unit !== undefined) next.unit = patch.unit;
    if (patch.target === null) delete next.target;
    else if (patch.target !== undefined) next.target = patch.target;
    if (patch.step !== undefined) next.step = patch.step;
  }
  if ((next.kind === "choice" || next.kind === "scale") && patch.options !== undefined) {
    next.options = patch.options;
  }
  return next;
}

const PATCH_KEYS = [
  "name",
  "description",
  "icon",
  "color",
  "direction",
  "unit",
  "target",
  "step",
  "options",
] as const satisfies readonly (keyof HabitPatch)[];

/** The patch that brings back the old value of each field that `patch` changes (null: not set). */
function inversePatch(habit: Habit, patch: HabitPatch): HabitPatch {
  const old: Partial<Record<(typeof PATCH_KEYS)[number], unknown>> = habit;
  const patched: typeof old = patchHabit(habit, patch);
  const inverse: Record<string, unknown> = {};
  for (const key of PATCH_KEYS) {
    if (!isEqual(old[key], patched[key])) inverse[key] = old[key] ?? null;
  }
  return inverse as HabitPatch;
}

function withHabit(state: HabitState, habit: Habit): HabitState {
  return { ...state, habits: { ...state.habits, [habit.id]: habit } };
}

function withEntry(state: HabitState, entry: Entry): HabitState {
  return { ...state, entries: { ...state.entries, [entryKey(entry.habitId, entry.day)]: entry } };
}

/**
 * The Action that undoes `action`, computed from the state BEFORE `action`. For example, the
 * inverse of a setEntry over an existing Entry is a setEntry with the old value, and over no Entry
 * it is a clearEntry. The inverse of a batch is the batch of inverses in reverse order, flat: it
 * holds no batches. The inverse of a create is a delete. An Action that changes nothing has an
 * empty batch as its inverse.
 */
export function invertAction(state: HabitState, action: Action): Action {
  if (action.type === "batch") {
    const inverses: Action[] = [];
    let current = state;
    for (const inner of action.actions) {
      const inverse = invertAction(current, inner);
      // A batch inverse is flat (an empty one for an Action that changes nothing), so its Actions
      // join this batch.
      inverses.unshift(...(inverse.type === "batch" ? inverse.actions : [inverse]));
      // The time is not part of an inverse, so any `now` does.
      current = applyAction(current, inner, 0);
    }
    return { type: "batch", actions: inverses };
  }
  // An Action that changes nothing is undone by nothing.
  if (applyAction(state, action, 0) === state) return { type: "batch", actions: [] };
  switch (action.type) {
    case "setEntry":
    case "clearEntry": {
      const { habitId, day } = action;
      const old = entryValue(state, habitId, day);
      return old === undefined
        ? { type: "clearEntry", habitId, day }
        : { type: "setEntry", habitId, day, value: old };
    }
    case "createHabit":
      return { type: "deleteHabit", id: action.habit.id };
    case "updateHabit": {
      const habit = state.habits[action.id]!;
      return { type: "updateHabit", id: action.id, patch: inversePatch(habit, action.patch) };
    }
    case "moveHabit":
      return { type: "moveHabit", id: action.id, order: state.habits[action.id]!.order };
    case "deleteHabit":
      return { type: "restoreHabit", id: action.id };
    case "restoreHabit":
      return { type: "deleteHabit", id: action.id };
  }
}

/**
 * The largest `order` of all Habits, also the deleted ones, or undefined without Habits. Give it to
 * `createHabit`, so that a new Habit never gets the order of a deleted Habit that a restore brings
 * back.
 */
export function lastOrder(state: HabitState): string | undefined {
  let last: string | undefined;
  for (const habit of Object.values(state.habits)) {
    if (last === undefined || habit.order > last) last = habit.order;
  }
  return last;
}

/** The Habits that are not deleted, sorted by `order`, then by `id` (a plain comparison of the text). */
export function visibleHabits(state: HabitState): Habit[] {
  return Object.values(state.habits)
    .filter((habit) => habit.deletedAt === undefined)
    .sort((a, b) => compareText(a.order, b.order) || compareText(a.id, b.id));
}

/** The value of the Entry of a Habit on a Day, or undefined when there is no Entry (or a cleared one). */
export function entryValue(state: HabitState, habitId: HabitId, day: Day): EntryValue | undefined {
  const entry = state.entries[entryKey(habitId, day)];
  return entry === undefined || entry.deletedAt !== undefined ? undefined : entry.value;
}

function compareText(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
