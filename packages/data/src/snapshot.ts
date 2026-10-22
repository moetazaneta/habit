import type { HabitState } from "@habit/core";
import type { UseStore } from "idb-keyval";
import { createStore, del, get, set } from "idb-keyval";

/**
 * The version of the snapshot's shape. Increase it when `HabitState`, `Habit` or `Entry` change in
 * a way that an old snapshot would break: the app then ignores the old snapshot.
 */
export const SNAPSHOT_VERSION = 1;

/** A snapshot older than this is not shown at start (docs/v1.md, "Instant start"). */
export const SNAPSHOT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

/** The last live data of the live window, kept in IndexedDB for an instant start. */
export interface Snapshot {
  version: number;
  /** The Clerk user id of the owner of the data. */
  userId: string;
  /** Milliseconds since the epoch. */
  savedAt: number;
  state: HabitState;
}

/** Where the snapshot is kept. `HabitDataProvider` uses IndexedDB; tests use memory. */
export interface SnapshotStore {
  /** The stored value, or undefined. It can be anything: check it with `usableSnapshot`. */
  load: () => Promise<unknown>;
  save: (snapshot: Snapshot) => Promise<void>;
  clear: () => Promise<void>;
}

/**
 * The snapshot when the app may show it at start: the same user, the same version, and less than
 * 24 hours old. Otherwise null.
 */
export function usableSnapshot(value: unknown, userId: string, now: number): Snapshot | null {
  if (!isSnapshot(value)) return null;
  if (value.version !== SNAPSHOT_VERSION || value.userId !== userId) return null;
  const age = now - value.savedAt;
  return age >= 0 && age < SNAPSHOT_MAX_AGE_MS ? value : null;
}

function isSnapshot(value: unknown): value is Snapshot {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  const state = v.state as Record<string, unknown> | null | undefined;
  return (
    typeof v.version === "number" &&
    typeof v.userId === "string" &&
    typeof v.savedAt === "number" &&
    typeof state === "object" &&
    state !== null &&
    typeof state.habits === "object" &&
    state.habits !== null &&
    typeof state.entries === "object" &&
    state.entries !== null
  );
}

const KEY = "snapshot";

/**
 * The snapshot in IndexedDB (database "habit", store "snapshot"). Without IndexedDB, as in a
 * private window of some browsers, nothing is kept and the app starts without a snapshot.
 */
export function indexedDbSnapshotStore(): SnapshotStore {
  let store: UseStore | undefined;
  const open = (): UseStore => (store ??= createStore("habit", "snapshot"));
  return {
    load: async () => {
      try {
        return await get(KEY, open());
      } catch {
        return undefined;
      }
    },
    save: async (snapshot) => {
      try {
        await set(KEY, snapshot, open());
      } catch {
        // No snapshot: the next start waits for the live data.
      }
    },
    clear: async () => {
      try {
        await del(KEY, open());
      } catch {
        // Nothing to clear.
      }
    },
  };
}
