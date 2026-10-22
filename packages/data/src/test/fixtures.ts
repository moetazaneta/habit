import type { Day, Entry, EntryValue, Habit, HabitId } from "@habit/core";

import type { Snapshot, SnapshotStore } from "../snapshot";

/** A check Habit with the id `id`. */
export function checkHabit(id: string, fields: Partial<Habit> = {}): Habit {
  return {
    id: id as HabitId,
    name: id,
    description: "",
    icon: { type: "phosphor", name: "circle" },
    color: "blue",
    direction: "build",
    kind: "check",
    order: "a0",
    createdAt: 1,
    updatedAt: 1,
    ...fields,
  } as Habit;
}

export function entry(
  habitId: string,
  day: string,
  fields: Partial<Entry> = {},
  value: EntryValue = { kind: "check" },
): Entry {
  return { habitId: habitId as HabitId, day: day as Day, value, updatedAt: 1, ...fields };
}

export interface MemorySnapshotStore extends SnapshotStore {
  value: unknown;
  saved: Snapshot[];
  cleared: number;
}

/** A SnapshotStore in memory, with what it holds and what it saved. */
export function memorySnapshotStore(initial?: unknown): MemorySnapshotStore {
  const store: MemorySnapshotStore = {
    value: initial,
    saved: [] as Snapshot[],
    cleared: 0,
    load: () => Promise.resolve(store.value),
    save: (snapshot: Snapshot) => {
      store.value = snapshot;
      store.saved.push(snapshot);
      return Promise.resolve();
    },
    clear: () => {
      store.value = undefined;
      store.cleared += 1;
      return Promise.resolve();
    },
  };
  return store;
}
