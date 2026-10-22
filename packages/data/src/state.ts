import type { Action, Day, Entry, Habit, HabitState } from "@habit/core";
import { applyAction, entryKey } from "@habit/core";

/** What the queries `data.days` and `data.month` return. */
export interface Data {
  habits: Habit[];
  entries: Entry[];
}

/** A HabitState from the Habits and from one or more lists of Entries. */
export function stateOf(habits: readonly Habit[], ...entryLists: readonly Entry[][]): HabitState {
  const state: HabitState = { habits: {}, entries: {} };
  for (const habit of habits) state.habits[habit.id] = habit;
  return withEntries(state, ...entryLists);
}

/** The state with more Entries (of older Months, for example). Same object when there are none. */
export function withEntries(state: HabitState, ...entryLists: readonly Entry[][]): HabitState {
  if (entryLists.every((entries) => entries.length === 0)) return state;
  const next: HabitState = { habits: state.habits, entries: { ...state.entries } };
  for (const entries of entryLists) {
    for (const entry of entries) next.entries[entryKey(entry.habitId, entry.day)] = entry;
  }
  return next;
}

/**
 * The query result for a range of Days after `action`, as the server would return it: all Habits,
 * and the Entries in the range without the tombstones of cleared ones. Null when `applyAction`
 * rejects the Action: then the server rejects it too, and the screen keeps the old data.
 */
export function applyToData(
  data: Data,
  range: { from: Day; to: Day },
  action: Action,
  now: number,
): Data | null {
  let next: HabitState;
  try {
    next = applyAction(stateOf(data.habits, data.entries), action, now);
  } catch {
    return null;
  }
  return {
    habits: Object.values(next.habits),
    entries: Object.values(next.entries).filter(
      (entry) => entry.deletedAt === undefined && entry.day >= range.from && entry.day <= range.to,
    ),
  };
}

/** `applyAction` that keeps the old state when the Action does not apply. */
export function applySafely(state: HabitState, action: Action, now: number): HabitState {
  try {
    return applyAction(state, action, now);
  } catch {
    return state;
  }
}

type LeafAction = Exclude<Action, { type: "batch" }>;

/** An Action with at most one level of batch: what the server accepts. */
export type FlatAction = LeafAction | { type: "batch"; actions: LeafAction[] };

/**
 * The same Action with nested batches flattened into one batch, in the same order. The server
 * accepts only one level of batch (Convex validators cannot be recursive).
 */
export function flattenAction(action: Action): FlatAction {
  if (action.type !== "batch") return action;
  const leaves: LeafAction[] = [];
  const visit = (a: Action): void => {
    if (a.type === "batch") a.actions.forEach(visit);
    else leaves.push(a);
  };
  visit(action);
  return { type: "batch", actions: leaves };
}
