// @vitest-environment edge-runtime
import type { Action, Day, EntryValue, Habit, HabitId } from "@habit/core";
import { convexTest } from "convex-test";
import { afterEach, beforeEach, describe, expect, test, vi } from "vite-plus/test";

import { api } from "./_generated/api";
import schema from "./schema";
import { modules } from "./test.setup";

const OWNER = "user_owner";
const OTHER_OWNER = "user_other_owner";
const ALL: { from: Day; to: Day } = { from: "2000-01-01" as Day, to: "2099-12-31" as Day };
const DAY = "2026-10-20" as Day;

beforeEach(() => {
  vi.stubEnv("OWNER_USER_IDS", `${OWNER},${OTHER_OWNER}`);
});
afterEach(() => {
  vi.unstubAllEnvs();
});

function numberHabit(id: string): Extract<Habit, { kind: "number" }> {
  return {
    id: id as HabitId,
    name: id,
    description: "",
    icon: { type: "emoji", emoji: "💧" },
    color: "sky",
    direction: "build",
    kind: "number",
    step: 1,
    order: "a0",
    createdAt: 1,
    updatedAt: 1,
  };
}

const water = "water" as HabitId;
const amount = (value: number): EntryValue => ({ kind: "number", value });

function setup() {
  const t = convexTest(schema, modules);
  const owner = t.withIdentity({ subject: OWNER });
  const perform = (action: Action, now: number) =>
    owner.mutation(api.data.perform, { action: action as never, now });
  const days = () => owner.query(api.data.days, ALL);
  return { t, owner, perform, days };
}

describe("perform", () => {
  test("creates a Habit and sets and clears its Entries", async () => {
    const { perform, days } = setup();

    await perform({ type: "createHabit", habit: numberHabit("water") }, 100);
    await perform({ type: "setEntry", habitId: water, day: DAY, value: amount(2) }, 200);
    expect((await days()).entries).toEqual([
      { habitId: water, day: DAY, value: amount(2), updatedAt: 200 },
    ]);
    expect((await days()).habits[0]).toMatchObject({ id: water, updatedAt: 100 });

    await perform({ type: "clearEntry", habitId: water, day: DAY }, 300);
    expect((await days()).entries).toEqual([]);
  });

  test("a set after a clear brings the Entry back", async () => {
    const { perform, days } = setup();
    await perform({ type: "createHabit", habit: numberHabit("water") }, 100);
    await perform({ type: "setEntry", habitId: water, day: DAY, value: amount(1) }, 200);
    await perform({ type: "clearEntry", habitId: water, day: DAY }, 300);

    await perform({ type: "setEntry", habitId: water, day: DAY, value: amount(5) }, 400);

    expect((await days()).entries).toEqual([
      { habitId: water, day: DAY, value: amount(5), updatedAt: 400 },
    ]);
  });

  test("the last write wins: a write older than the stored row changes nothing", async () => {
    const { perform, days } = setup();
    await perform({ type: "createHabit", habit: numberHabit("water") }, 100);
    await perform({ type: "setEntry", habitId: water, day: DAY, value: amount(3) }, 500);

    // A phone that was offline sends a change it made before the 500 one.
    await perform({ type: "setEntry", habitId: water, day: DAY, value: amount(1) }, 400);
    await perform({ type: "updateHabit", id: water, patch: { name: "Old name" } }, 50);

    const data = await days();
    expect(data.entries).toEqual([{ habitId: water, day: DAY, value: amount(3), updatedAt: 500 }]);
    expect(data.habits[0]).toMatchObject({ name: "water", updatedAt: 100 });
  });

  test("a clear older than the stored Entry does not remove it", async () => {
    const { perform, days } = setup();
    await perform({ type: "createHabit", habit: numberHabit("water") }, 100);
    await perform({ type: "setEntry", habitId: water, day: DAY, value: amount(3) }, 500);

    await perform({ type: "clearEntry", habitId: water, day: DAY }, 400);

    expect((await days()).entries).toHaveLength(1);
  });

  test("a time after the server's clock counts as the server's time", async () => {
    const { perform, days } = setup();
    const future = Date.now() + 1e9;
    await perform({ type: "createHabit", habit: numberHabit("water") }, future);

    // A later write from a device with a correct clock still wins over the wrong clock.
    await perform({ type: "updateHabit", id: water, patch: { name: "Water" } }, Date.now());

    const habit = (await days()).habits[0];
    expect(habit?.name).toBe("Water");
    expect(habit?.updatedAt).toBeLessThanOrEqual(Date.now());
  });

  test("a batch applies in order, and a retry of the same batch changes nothing", async () => {
    const { perform, days } = setup();
    await perform({ type: "createHabit", habit: numberHabit("water") }, 100);
    const paint: Action = {
      type: "batch",
      actions: [
        { type: "setEntry", habitId: water, day: "2026-10-18" as Day, value: amount(1) },
        { type: "setEntry", habitId: water, day: "2026-10-19" as Day, value: amount(1) },
        { type: "setEntry", habitId: water, day: "2026-10-19" as Day, value: amount(2) },
      ],
    };

    await perform(paint, 200);
    await perform(paint, 200);

    expect((await days()).entries.map((e) => [e.day, e.value])).toEqual([
      ["2026-10-18", amount(1)],
      ["2026-10-19", amount(2)],
    ]);
  });

  test("delete is soft, and restore brings the Habit back", async () => {
    const { perform, days } = setup();
    await perform({ type: "createHabit", habit: numberHabit("water") }, 100);

    await perform({ type: "deleteHabit", id: water }, 200);
    expect((await days()).habits[0]).toMatchObject({ id: water, deletedAt: 200 });

    await perform({ type: "restoreHabit", id: water }, 300);
    const habit = (await days()).habits[0];
    expect(habit).toMatchObject({ id: water, updatedAt: 300 });
    expect(habit).not.toHaveProperty("deletedAt");
  });

  test("an update patch can remove an optional field", async () => {
    const { perform, days } = setup();
    await perform({ type: "createHabit", habit: { ...numberHabit("water"), target: 8 } }, 100);

    await perform({ type: "updateHabit", id: water, patch: { target: null, unit: "glass" } }, 200);

    const habit = (await days()).habits[0];
    expect(habit).toMatchObject({ unit: "glass" });
    expect(habit).not.toHaveProperty("target");
  });

  test("each owner writes and reads only their own rows", async () => {
    const { t, perform, days } = setup();
    const other = t.withIdentity({ subject: OTHER_OWNER });
    await perform({ type: "createHabit", habit: numberHabit("water") }, 100);
    await perform({ type: "setEntry", habitId: water, day: DAY, value: amount(1) }, 200);

    // The same client id under another user is another Habit.
    await other.mutation(api.data.perform, {
      action: { type: "setEntry", habitId: water, day: DAY, value: amount(9) },
      now: 300,
    });
    expect(await other.query(api.data.days, ALL)).toEqual({ habits: [], entries: [] });
    expect((await days()).entries).toEqual([
      { habitId: water, day: DAY, value: amount(1), updatedAt: 200 },
    ]);
  });

  test("rejects a Day that is not a real date", async () => {
    const { perform } = setup();
    await perform({ type: "createHabit", habit: numberHabit("water") }, 100);
    await expect(
      perform(
        { type: "setEntry", habitId: water, day: "2026-02-30" as Day, value: amount(1) },
        200,
      ),
    ).rejects.toThrow(/badDay/);
  });
});
