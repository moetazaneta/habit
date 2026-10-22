import "fake-indexeddb/auto";

import type { Day, HabitState } from "@habit/core";
import { describe, expect, test } from "vite-plus/test";

import type { Snapshot } from "./snapshot";
import {
  indexedDbSnapshotStore,
  SNAPSHOT_MAX_AGE_MS,
  SNAPSHOT_VERSION,
  usableSnapshot,
} from "./snapshot";
import { stateOf } from "./state";
import { checkHabit, entry } from "./test/fixtures";

const NOW = Date.UTC(2026, 9, 22, 12);
const state: HabitState = stateOf([checkHabit("water")], [entry("water", "2026-10-22")]);
const snapshot: Snapshot = {
  version: SNAPSHOT_VERSION,
  userId: "user_1",
  savedAt: NOW - 1000,
  state,
};

describe("usableSnapshot", () => {
  test("a snapshot of the same user and version, less than 24 hours old, is used", () => {
    expect(usableSnapshot(snapshot, "user_1", NOW)).toBe(snapshot);
    expect(
      usableSnapshot({ ...snapshot, savedAt: NOW - SNAPSHOT_MAX_AGE_MS + 1 }, "user_1", NOW),
    ).not.toBeNull();
  });

  test.each([
    ["of another user", snapshot, "user_2"],
    ["of another schema version", { ...snapshot, version: SNAPSHOT_VERSION + 1 }, "user_1"],
    ["24 hours old", { ...snapshot, savedAt: NOW - SNAPSHOT_MAX_AGE_MS }, "user_1"],
    ["saved in the future (a changed clock)", { ...snapshot, savedAt: NOW + 60_000 }, "user_1"],
    ["of an unknown shape", { version: SNAPSHOT_VERSION, userId: "user_1" }, "user_1"],
    ["missing", undefined, "user_1"],
  ])("a snapshot %s is not used", (_, value, userId) => {
    expect(usableSnapshot(value, userId, NOW)).toBeNull();
  });
});

describe("indexedDbSnapshotStore", () => {
  test("keeps the snapshot in IndexedDB until it is cleared", async () => {
    const store = indexedDbSnapshotStore();
    expect(await store.load()).toBeUndefined();

    await store.save(snapshot);
    expect(await indexedDbSnapshotStore().load()).toEqual(snapshot);

    await store.clear();
    expect(await indexedDbSnapshotStore().load()).toBeUndefined();
  });

  test("the loaded snapshot keeps its Days and values", async () => {
    const store = indexedDbSnapshotStore();
    await store.save(snapshot);
    const loaded = usableSnapshot(await store.load(), "user_1", NOW);
    expect(loaded?.state.entries[`water:${"2026-10-22" as Day}`]?.value).toEqual({ kind: "check" });
  });
});
