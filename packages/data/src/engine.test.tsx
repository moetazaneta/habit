import type { Action, Day, HabitId, Month } from "@habit/core";
import { entryValue, visibleHabits } from "@habit/core";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vite-plus/test";

import type { EngineInputs } from "./engine";
import { SNAPSHOT_SAVE_DELAY_MS, useHabitDataEngine } from "./engine";
import { SNAPSHOT_MAX_AGE_MS, SNAPSHOT_VERSION } from "./snapshot";
import type { Data, FlatAction } from "./state";
import { stateOf } from "./state";
import { checkHabit, entry, memorySnapshotStore } from "./test/fixtures";

const NOW = Date.UTC(2026, 9, 22, 12);
const USER = "user_1";
const water = "water" as HabitId;
const read = "read" as HabitId;
const TODAY = "2026-10-22" as Day;
const YESTERDAY = "2026-10-21" as Day;

const liveData: Data = {
  habits: [checkHabit("water"), checkHabit("read", { order: "a1" })],
  entries: [entry("water", "2026-10-20")],
};

function snapshotOf(fields: Record<string, unknown> = {}) {
  return {
    version: SNAPSHOT_VERSION,
    userId: USER,
    savedAt: NOW - 60_000,
    state: stateOf([checkHabit("water")], [entry("water", "2026-10-19")]),
    ...fields,
  };
}

const set = (habitId: HabitId, day: Day): Action => ({
  type: "setEntry",
  habitId,
  day,
  value: { kind: "check" },
});

function setup(inputs: Partial<EngineInputs> & { stored?: unknown } = {}) {
  const snapshots = memorySnapshotStore(inputs.stored);
  const sent: { action: FlatAction; now: number }[] = [];
  const props: EngineInputs = {
    clerkLoaded: true,
    userId: USER,
    me: undefined,
    live: undefined,
    months: new Map(),
    window: { from: "2025-10-01" as Day, to: TODAY },
    retainMonth: () => () => {},
    send: (action, now) => {
      sent.push({ action, now });
      return Promise.resolve();
    },
    signIn: vi.fn(),
    signOut: vi.fn(() => Promise.resolve()),
    snapshots,
    clock: () => NOW,
    ...inputs,
  };
  const hook = renderHook((p: EngineInputs) => useHabitDataEngine(p), { initialProps: props });
  const update = (changes: Partial<EngineInputs>) => {
    Object.assign(props, changes);
    hook.rerender({ ...props });
  };
  return { ...hook, update, snapshots, sent };
}

afterEach(() => {
  vi.useRealTimers();
});

describe("sign-in and access", () => {
  test("nobody is signed in: signedOut, with signIn", () => {
    const signIn = vi.fn();
    const { result } = setup({ userId: null, signIn });
    expect(result.current.auth.status).toBe("signedOut");
    if (result.current.auth.status === "signedOut") result.current.auth.signIn();
    expect(signIn).toHaveBeenCalledOnce();
  });

  test("Clerk is not loaded yet: loading", () => {
    const { result } = setup({ clerkLoaded: false, userId: null });
    expect(result.current.auth).toEqual({ status: "loading" });
  });

  test("an owner is ready, and the server's data is live", async () => {
    const { result } = setup({ me: { userId: USER, isOwner: true }, live: liveData });
    await waitFor(() => expect(result.current.auth.status).toBe("ready"));
    expect(result.current.source).toBe("live");
    expect(visibleHabits(result.current.state).map((h) => h.id)).toEqual(["water", "read"]);
  });

  test("a user who is not an owner gets noAccess with the user id, and the snapshot goes away", async () => {
    const { result, snapshots } = setup({
      me: { userId: USER, isOwner: false },
      stored: snapshotOf(),
    });
    await waitFor(() => expect(snapshots.cleared).toBe(1));
    expect(result.current.auth).toMatchObject({ status: "noAccess", userId: USER });
    expect(result.current.source).toBe("none");
  });

  test("sign out clears the snapshot first", async () => {
    const signOut = vi.fn(() => Promise.resolve());
    const { result, snapshots } = setup({
      me: { userId: USER, isOwner: true },
      live: liveData,
      stored: snapshotOf(),
      signOut,
    });
    await waitFor(() => expect(result.current.auth.status).toBe("ready"));
    if (result.current.auth.status === "ready") result.current.auth.signOut();
    await waitFor(() => expect(signOut).toHaveBeenCalledOnce());
    expect(snapshots.cleared).toBe(1);
  });
});

describe("instant start", () => {
  test("a fresh snapshot of the same user shows at once, before the server answers", async () => {
    const { result } = setup({ stored: snapshotOf() });
    expect(result.current.auth.status).toBe("loading");

    await waitFor(() => expect(result.current.source).toBe("snapshot"));
    expect(result.current.auth).toMatchObject({ status: "ready", userId: USER });
    expect(entryValue(result.current.state, water, "2026-10-19" as Day)).toEqual({ kind: "check" });
  });

  test.each([
    ["of another user", snapshotOf({ userId: "user_2" })],
    ["of another schema version", snapshotOf({ version: SNAPSHOT_VERSION + 1 })],
    ["older than 24 hours", snapshotOf({ savedAt: NOW - SNAPSHOT_MAX_AGE_MS - 1 })],
  ])("a snapshot %s is not shown: the app waits for the live data", async (_, stored) => {
    const { result, update } = setup({ stored });
    await act(() => Promise.resolve());
    expect(result.current.auth.status).toBe("loading");
    expect(result.current.source).toBe("none");

    update({ me: { userId: USER, isOwner: true }, live: liveData });
    expect(result.current.source).toBe("live");
  });

  test("the live data replaces the snapshot when it comes", async () => {
    const { result, update } = setup({ stored: snapshotOf() });
    await waitFor(() => expect(result.current.source).toBe("snapshot"));

    update({ me: { userId: USER, isOwner: true }, live: liveData });

    expect(result.current.source).toBe("live");
    expect(entryValue(result.current.state, water, "2026-10-19" as Day)).toBeUndefined();
    expect(entryValue(result.current.state, water, "2026-10-20" as Day)).toEqual({ kind: "check" });
  });

  test("taps before the live data show at once and go to the server in order when it comes", async () => {
    const { result, update, sent } = setup({ stored: snapshotOf() });
    await waitFor(() => expect(result.current.source).toBe("snapshot"));

    let first!: ReturnType<typeof result.current.perform>;
    act(() => {
      first = result.current.perform(set(water, TODAY));
      result.current.perform({ type: "clearEntry", habitId: water, day: TODAY });
      result.current.perform(set(water, YESTERDAY));
    });

    expect(sent).toEqual([]);
    expect(entryValue(result.current.state, water, TODAY)).toBeUndefined();
    expect(entryValue(result.current.state, water, YESTERDAY)).toEqual({ kind: "check" });

    update({ me: { userId: USER, isOwner: true }, live: liveData });

    await waitFor(() => expect(sent).toHaveLength(3));
    expect(sent.map((s) => s.action.type)).toEqual(["setEntry", "clearEntry", "setEntry"]);
    expect(sent.every((s) => s.now === NOW)).toBe(true);
    await expect(first.done).resolves.toBeUndefined();
  });

  test("taps that wait fail when the user signs out", async () => {
    const { result, update, sent } = setup({ stored: snapshotOf() });
    await waitFor(() => expect(result.current.source).toBe("snapshot"));
    let done!: Promise<void>;
    act(() => {
      done = result.current.perform(set(water, TODAY)).done;
    });

    update({ userId: null });

    await expect(done).rejects.toThrow(/signed out/);
    expect(sent).toEqual([]);
  });

  test("the live data of the window becomes the snapshot of the user", async () => {
    vi.useFakeTimers();
    const { snapshots } = setup({ me: { userId: USER, isOwner: true }, live: liveData });

    await act(() => vi.advanceTimersByTimeAsync(SNAPSHOT_SAVE_DELAY_MS));

    expect(snapshots.saved).toEqual([
      {
        version: SNAPSHOT_VERSION,
        userId: USER,
        savedAt: NOW,
        state: stateOf(liveData.habits, liveData.entries),
      },
    ]);
  });
});

describe("perform", () => {
  test("sends the Action at once when the data is live, with the inverse for undo", async () => {
    const { result, sent } = setup({ me: { userId: USER, isOwner: true }, live: liveData });

    const { inverse, done } = result.current.perform(set(read, TODAY));

    expect(sent).toEqual([{ action: set(read, TODAY), now: NOW }]);
    expect(inverse).toEqual({ type: "clearEntry", habitId: read, day: TODAY });
    await expect(done).resolves.toBeUndefined();
  });

  test("a second Action before the next render gets the right inverse", () => {
    const { result } = setup({ me: { userId: USER, isOwner: true }, live: liveData });

    result.current.perform(set(read, TODAY));
    const second = result.current.perform({ type: "clearEntry", habitId: read, day: TODAY });

    expect(second.inverse).toEqual(set(read, TODAY));
  });

  test("done rejects when the write fails", async () => {
    const failure = new Error("network");
    const { result } = setup({
      me: { userId: USER, isOwner: true },
      live: liveData,
      send: () => Promise.reject(failure),
    });

    await expect(result.current.perform(set(read, TODAY)).done).rejects.toBe(failure);
  });

  test("nested batches go to the server as one flat batch", () => {
    const { result, sent } = setup({ me: { userId: USER, isOwner: true }, live: liveData });

    result.current.perform({
      type: "batch",
      actions: [set(read, TODAY), { type: "batch", actions: [set(read, YESTERDAY)] }],
    });

    expect(sent[0]?.action).toEqual({
      type: "batch",
      actions: [set(read, TODAY), set(read, YESTERDAY)],
    });
  });
});

describe("months", () => {
  test("a Month in the live window is ready with the live data; an older one when it loads", () => {
    const older = "2025-09" as Month;
    const { result, update } = setup({ me: { userId: USER, isOwner: true }, live: liveData });

    expect(result.current.monthStatus("2026-10" as Month)).toBe("ready");
    expect(result.current.monthStatus("2025-10" as Month)).toBe("ready");
    expect(result.current.monthStatus(older)).toBe("loading");

    update({ months: new Map([[older, { habits: [], entries: [entry("read", "2025-09-03")] }]]) });

    expect(result.current.monthStatus(older)).toBe("ready");
    expect(entryValue(result.current.state, read, "2025-09-03" as Day)).toEqual({ kind: "check" });
  });
});
