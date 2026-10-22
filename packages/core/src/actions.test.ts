import { describe, expect, test } from "vite-plus/test";

import {
  applyAction,
  emptyState,
  entryValue,
  invertAction,
  lastOrder,
  visibleHabits,
  type Action,
  type HabitState,
} from "./actions";
import { parseDay, type Day } from "./day";
import { entryKey, type Entry } from "./entry";
import type { Habit } from "./habit";
import type { HabitId } from "./ids";
import { checkHabit, numberHabit, option, scaleHabit, textHabit } from "./test-fixtures";

const day = (text: string): Day => parseDay(text);

function stateOf(habits: Habit[], entries: Entry[] = []): HabitState {
  return {
    habits: Object.fromEntries(habits.map((habit) => [habit.id, habit])),
    entries: Object.fromEntries(
      entries.map((entry) => [entryKey(entry.habitId, entry.day), entry]),
    ),
  };
}

describe("entryValue", () => {
  const water = numberHabit({ target: 8 });
  const state = stateOf(
    [water],
    [
      {
        habitId: water.id,
        day: day("2026-10-21"),
        value: { kind: "number", value: 6 },
        updatedAt: 1,
      },
      {
        habitId: water.id,
        day: day("2026-10-20"),
        value: { kind: "number", value: 3 },
        updatedAt: 2,
        deletedAt: 2,
      },
    ],
  );

  test("gives the value of the Entry of a Habit on a Day", () => {
    expect(entryValue(state, water.id, day("2026-10-21"))).toEqual({ kind: "number", value: 6 });
  });

  test("gives nothing for a Day without an Entry or with a cleared one", () => {
    expect(entryValue(state, water.id, day("2026-10-22"))).toBeUndefined();
    expect(entryValue(state, water.id, day("2026-10-20"))).toBeUndefined();
    expect(entryValue(state, "unknown" as HabitId, day("2026-10-21"))).toBeUndefined();
  });
});

describe("lastOrder", () => {
  test("is the largest order of all Habits, also the deleted ones", () => {
    const state = stateOf([
      checkHabit({ order: "a1" }),
      checkHabit({ order: "a3", deletedAt: 5 }),
      checkHabit({ order: "a2" }),
    ]);
    expect(lastOrder(state)).toBe("a3");
  });

  test("is undefined without Habits", () => {
    expect(lastOrder(emptyState())).toBeUndefined();
  });
});

describe("visibleHabits", () => {
  test("sorts by order, then by id", () => {
    const water = checkHabit({ id: "b" as HabitId, order: "a1" });
    const read = checkHabit({ id: "c" as HabitId, order: "a0" });
    const gym = checkHabit({ id: "a" as HabitId, order: "a1" });
    expect(visibleHabits(stateOf([water, read, gym])).map((habit) => habit.id)).toEqual([
      "c",
      "a",
      "b",
    ]);
  });

  test("compares the order keys as plain text, where capitals sort first", () => {
    // fractional-indexing keys use 0-9, A-Z and a-z; `localeCompare` would put "a0" before "Zz".
    const late = checkHabit({ order: "a0" });
    const early = checkHabit({ order: "Zz" });
    expect(visibleHabits(stateOf([late, early]))).toEqual([early, late]);
  });

  test("hides the deleted Habits", () => {
    const kept = checkHabit({ order: "a0" });
    const deleted = checkHabit({ order: "a1", deletedAt: 5 });
    expect(visibleHabits(stateOf([kept, deleted]))).toEqual([kept]);
    expect(visibleHabits(emptyState())).toEqual([]);
  });
});

describe("applyAction", () => {
  const today = day("2026-10-22");

  describe("setEntry", () => {
    const water = numberHabit({ target: 8 });
    const six = { kind: "number", value: 6 } as const;

    test("adds an Entry with `updatedAt = now`", () => {
      const state = stateOf([water]);
      const next = applyAction(
        state,
        { type: "setEntry", habitId: water.id, day: today, value: six },
        50,
      );
      expect(next.entries[entryKey(water.id, today)]).toEqual({
        habitId: water.id,
        day: today,
        value: six,
        updatedAt: 50,
      });
    });

    test("replaces the value of an existing Entry", () => {
      const state = stateOf([water], [{ habitId: water.id, day: today, value: six, updatedAt: 1 }]);
      const next = applyAction(
        state,
        { type: "setEntry", habitId: water.id, day: today, value: { kind: "number", value: 7 } },
        50,
      );
      expect(entryValue(next, water.id, today)).toEqual({ kind: "number", value: 7 });
      expect(next.entries[entryKey(water.id, today)]?.updatedAt).toBe(50);
    });

    test("brings back a cleared Entry", () => {
      const state = stateOf(
        [water],
        [{ habitId: water.id, day: today, value: six, updatedAt: 1, deletedAt: 1 }],
      );
      const next = applyAction(
        state,
        { type: "setEntry", habitId: water.id, day: today, value: six },
        50,
      );
      expect(next.entries[entryKey(water.id, today)]).toEqual({
        habitId: water.id,
        day: today,
        value: six,
        updatedAt: 50,
      });
    });

    test("never changes the state it gets", () => {
      const state = stateOf([water], [{ habitId: water.id, day: today, value: six, updatedAt: 1 }]);
      const copy = structuredClone(state);
      applyAction(
        state,
        { type: "setEntry", habitId: water.id, day: today, value: { kind: "number", value: 7 } },
        50,
      );
      applyAction(state, { type: "clearEntry", habitId: water.id, day: today }, 50);
      expect(state).toEqual(copy);
    });

    test("returns the same state when the value is already there", () => {
      const state = stateOf([water], [{ habitId: water.id, day: today, value: six, updatedAt: 1 }]);
      expect(
        applyAction(
          state,
          { type: "setEntry", habitId: water.id, day: today, value: { kind: "number", value: 6 } },
          50,
        ),
      ).toBe(state);
    });

    test("ignores an unknown Habit, a deleted Habit and a value of another Kind", () => {
      const deleted = numberHabit({ deletedAt: 5 });
      const state = stateOf([water, deleted]);
      const unknown = "unknown" as HabitId;
      expect(
        applyAction(state, { type: "setEntry", habitId: unknown, day: today, value: six }, 50),
      ).toBe(state);
      expect(
        applyAction(state, { type: "setEntry", habitId: deleted.id, day: today, value: six }, 50),
      ).toBe(state);
      expect(
        applyAction(
          state,
          { type: "setEntry", habitId: water.id, day: today, value: { kind: "check" } },
          50,
        ),
      ).toBe(state);
    });
  });

  describe("clearEntry", () => {
    const meditate = checkHabit();

    test("leaves a tombstone with `deletedAt = now`", () => {
      const state = stateOf(
        [meditate],
        [{ habitId: meditate.id, day: today, value: { kind: "check" }, updatedAt: 1 }],
      );
      const next = applyAction(state, { type: "clearEntry", habitId: meditate.id, day: today }, 50);
      expect(entryValue(next, meditate.id, today)).toBeUndefined();
      expect(next.entries[entryKey(meditate.id, today)]).toEqual({
        habitId: meditate.id,
        day: today,
        value: { kind: "check" },
        updatedAt: 50,
        deletedAt: 50,
      });
    });

    test("returns the same state when there is no Entry to clear", () => {
      const state = stateOf(
        [meditate],
        [
          {
            habitId: meditate.id,
            day: today,
            value: { kind: "check" },
            updatedAt: 1,
            deletedAt: 1,
          },
        ],
      );
      expect(applyAction(state, { type: "clearEntry", habitId: meditate.id, day: today }, 50)).toBe(
        state,
      );
      expect(
        applyAction(
          state,
          { type: "clearEntry", habitId: meditate.id, day: day("2026-10-01") },
          50,
        ),
      ).toBe(state);
    });

    test("ignores an unknown or a deleted Habit", () => {
      const deleted = checkHabit({ deletedAt: 5 });
      const state = stateOf(
        [deleted],
        [{ habitId: deleted.id, day: today, value: { kind: "check" }, updatedAt: 1 }],
      );
      expect(applyAction(state, { type: "clearEntry", habitId: deleted.id, day: today }, 50)).toBe(
        state,
      );
    });
  });

  describe("createHabit", () => {
    test("adds the Habit with `updatedAt = now`", () => {
      const read = numberHabit({ createdAt: 40, updatedAt: 40 });
      const next = applyAction(emptyState(), { type: "createHabit", habit: read }, 50);
      expect(next.habits[read.id]).toEqual({ ...read, updatedAt: 50 });
      expect(visibleHabits(next)).toHaveLength(1);
    });

    test("does not replace a Habit with the same id", () => {
      const read = numberHabit();
      const state = stateOf([read]);
      expect(
        applyAction(state, { type: "createHabit", habit: { ...read, name: "Other" } }, 50),
      ).toBe(state);
    });
  });

  describe("updateHabit", () => {
    const water = numberHabit({ name: "Water", unit: "glasses", target: 8, step: 1 });

    test("changes the fields of the patch and sets `updatedAt = now`", () => {
      const next = applyAction(
        stateOf([water]),
        {
          type: "updateHabit",
          id: water.id,
          patch: { name: "Drink water", color: "teal", target: 10, step: 2 },
        },
        50,
      );
      expect(next.habits[water.id]).toEqual({
        ...water,
        name: "Drink water",
        color: "teal",
        target: 10,
        step: 2,
        updatedAt: 50,
      });
    });

    test("removes the unit and the Target for null, and keeps them for undefined", () => {
      const next = applyAction(
        stateOf([water]),
        { type: "updateHabit", id: water.id, patch: { unit: null, target: undefined } },
        50,
      );
      const habit = next.habits[water.id];
      expect(habit).not.toHaveProperty("unit");
      expect(habit).toMatchObject({ target: 8 });
      const noTarget = applyAction(
        next,
        { type: "updateHabit", id: water.id, patch: { target: null } },
        60,
      );
      expect(noTarget.habits[water.id]).not.toHaveProperty("target");
    });

    test("changes the Options of a scale Habit", () => {
      const mood = scaleHabit([option("Low"), option("High")]);
      const options = [option("High"), option("Low", { retiredAt: 50 }), option("Mid")];
      const next = applyAction(
        stateOf([mood]),
        { type: "updateHabit", id: mood.id, patch: { options } },
        50,
      );
      expect(next.habits[mood.id]).toMatchObject({ options });
    });

    test("ignores the fields of another Kind", () => {
      const meditate = checkHabit();
      const state = stateOf([meditate]);
      expect(
        applyAction(
          state,
          { type: "updateHabit", id: meditate.id, patch: { unit: "min", step: 5, options: [] } },
          50,
        ),
      ).toBe(state);
    });

    test("returns the same state when nothing changes, or for an unknown Habit", () => {
      const state = stateOf([water]);
      expect(
        applyAction(
          state,
          { type: "updateHabit", id: water.id, patch: { name: "Water", unit: "glasses" } },
          50,
        ),
      ).toBe(state);
      expect(
        applyAction(
          state,
          { type: "updateHabit", id: "unknown" as HabitId, patch: { name: "X" } },
          50,
        ),
      ).toBe(state);
    });
  });

  describe("moveHabit", () => {
    test("sets the order and `updatedAt = now`", () => {
      const first = checkHabit({ order: "a0" });
      const second = checkHabit({ order: "a1" });
      const next = applyAction(
        stateOf([first, second]),
        { type: "moveHabit", id: second.id, order: "Zz" },
        50,
      );
      expect(visibleHabits(next).map((habit) => habit.id)).toEqual([second.id, first.id]);
      expect(next.habits[second.id]).toMatchObject({ order: "Zz", updatedAt: 50 });
    });

    test("returns the same state for the same order or an unknown Habit", () => {
      const first = checkHabit({ order: "a0" });
      const state = stateOf([first]);
      expect(applyAction(state, { type: "moveHabit", id: first.id, order: "a0" }, 50)).toBe(state);
      expect(
        applyAction(state, { type: "moveHabit", id: "unknown" as HabitId, order: "a1" }, 50),
      ).toBe(state);
    });
  });

  describe("deleteHabit and restoreHabit", () => {
    const gym = checkHabit();
    const entry: Entry = { habitId: gym.id, day: today, value: { kind: "check" }, updatedAt: 1 };

    test("a delete sets `deletedAt` and keeps the Entries", () => {
      const next = applyAction(stateOf([gym], [entry]), { type: "deleteHabit", id: gym.id }, 50);
      expect(next.habits[gym.id]).toEqual({ ...gym, updatedAt: 50, deletedAt: 50 });
      expect(visibleHabits(next)).toEqual([]);
      expect(next.entries[entryKey(gym.id, today)]).toEqual(entry);
    });

    test("a restore removes `deletedAt`", () => {
      const deleted = applyAction(stateOf([gym], [entry]), { type: "deleteHabit", id: gym.id }, 50);
      const restored = applyAction(deleted, { type: "restoreHabit", id: gym.id }, 60);
      expect(restored.habits[gym.id]).toEqual({ ...gym, updatedAt: 60 });
      expect(entryValue(restored, gym.id, today)).toEqual({ kind: "check" });
    });

    test("returns the same state when there is nothing to delete or to restore", () => {
      const state = stateOf([gym]);
      expect(applyAction(state, { type: "restoreHabit", id: gym.id }, 50)).toBe(state);
      expect(applyAction(state, { type: "deleteHabit", id: "unknown" as HabitId }, 50)).toBe(state);
      const deleted = applyAction(state, { type: "deleteHabit", id: gym.id }, 50);
      expect(applyAction(deleted, { type: "deleteHabit", id: gym.id }, 60)).toBe(deleted);
    });
  });

  describe("batch", () => {
    test("applies its Actions in order, also nested batches", () => {
      const meditate = checkHabit();
      const next = applyAction(
        stateOf([meditate]),
        {
          type: "batch",
          actions: [
            {
              type: "setEntry",
              habitId: meditate.id,
              day: day("2026-10-20"),
              value: { kind: "check" },
            },
            {
              type: "batch",
              actions: [
                {
                  type: "setEntry",
                  habitId: meditate.id,
                  day: day("2026-10-21"),
                  value: { kind: "check" },
                },
                { type: "clearEntry", habitId: meditate.id, day: day("2026-10-20") },
              ],
            },
          ],
        },
        50,
      );
      expect(entryValue(next, meditate.id, day("2026-10-20"))).toBeUndefined();
      expect(entryValue(next, meditate.id, day("2026-10-21"))).toEqual({ kind: "check" });
    });

    test("an Action in a batch sees the Habit that an earlier Action created", () => {
      const read = numberHabit();
      const next = applyAction(
        emptyState(),
        {
          type: "batch",
          actions: [
            { type: "createHabit", habit: read },
            {
              type: "setEntry",
              habitId: read.id,
              day: today,
              value: { kind: "number", value: 10 },
            },
          ],
        },
        50,
      );
      expect(entryValue(next, read.id, today)).toEqual({ kind: "number", value: 10 });
    });

    test("an empty batch returns the same state", () => {
      const state = stateOf([checkHabit()]);
      expect(applyAction(state, { type: "batch", actions: [] }, 50)).toBe(state);
    });
  });
});

describe("invertAction", () => {
  const today = day("2026-10-22");
  const yesterday = day("2026-10-21");
  const water = numberHabit({ name: "Water", unit: "glasses", target: 8, order: "a0" });
  const meditate = checkHabit({ name: "Meditate", order: "a1" });
  const before = stateOf(
    [water, meditate],
    [
      { habitId: water.id, day: yesterday, value: { kind: "number", value: 6 }, updatedAt: 1 },
      { habitId: meditate.id, day: yesterday, value: { kind: "check" }, updatedAt: 1 },
      { habitId: meditate.id, day: today, value: { kind: "check" }, updatedAt: 1, deletedAt: 1 },
    ],
  );

  /** What the person sees: the visible Habits and the live Entries, without the timestamps. */
  function view(state: HabitState) {
    return {
      habits: visibleHabits(state).map(({ updatedAt: _updatedAt, ...habit }) => habit),
      entries: Object.values(state.entries)
        .filter((entry) => entry.deletedAt === undefined)
        .map(({ habitId, day, value }) => ({ habitId, day, value }))
        .sort((a, b) => entryKey(a.habitId, a.day).localeCompare(entryKey(b.habitId, b.day))),
    };
  }

  test("over an existing Entry, a setEntry goes back to the old value", () => {
    expect(
      invertAction(before, {
        type: "setEntry",
        habitId: water.id,
        day: yesterday,
        value: { kind: "number", value: 7 },
      }),
    ).toEqual({
      type: "setEntry",
      habitId: water.id,
      day: yesterday,
      value: { kind: "number", value: 6 },
    });
  });

  test("over no Entry or a cleared one, a setEntry is undone by a clearEntry", () => {
    const set = (habitId: HabitId, at: Day): Action => ({
      type: "setEntry",
      habitId,
      day: at,
      value: { kind: "check" },
    });
    expect(invertAction(before, set(meditate.id, day("2026-10-01")))).toEqual({
      type: "clearEntry",
      habitId: meditate.id,
      day: day("2026-10-01"),
    });
    expect(invertAction(before, set(meditate.id, today))).toEqual({
      type: "clearEntry",
      habitId: meditate.id,
      day: today,
    });
  });

  test("a clearEntry is undone by a setEntry with the old value", () => {
    expect(invertAction(before, { type: "clearEntry", habitId: water.id, day: yesterday })).toEqual(
      {
        type: "setEntry",
        habitId: water.id,
        day: yesterday,
        value: { kind: "number", value: 6 },
      },
    );
  });

  test("a create is undone by a delete, a delete by a restore, a restore by a delete", () => {
    const read = numberHabit();
    expect(invertAction(before, { type: "createHabit", habit: read })).toEqual({
      type: "deleteHabit",
      id: read.id,
    });
    expect(invertAction(before, { type: "deleteHabit", id: water.id })).toEqual({
      type: "restoreHabit",
      id: water.id,
    });
    const deleted = applyAction(before, { type: "deleteHabit", id: water.id }, 50);
    expect(invertAction(deleted, { type: "restoreHabit", id: water.id })).toEqual({
      type: "deleteHabit",
      id: water.id,
    });
  });

  test("an update is undone by an update with the old values, null for a field that was not set", () => {
    const habit = numberHabit({ name: "Read", step: 10 });
    expect(
      invertAction(stateOf([habit]), {
        type: "updateHabit",
        id: habit.id,
        patch: { name: "Read books", unit: "min", target: 30, step: 5 },
      }),
    ).toEqual({
      type: "updateHabit",
      id: habit.id,
      patch: { name: "Read", unit: null, target: null, step: 10 },
    });
  });

  test("a move is undone by a move to the old order", () => {
    expect(invertAction(before, { type: "moveHabit", id: meditate.id, order: "Zz" })).toEqual({
      type: "moveHabit",
      id: meditate.id,
      order: "a1",
    });
  });

  test("an Action that changes nothing is undone by an empty batch", () => {
    const nothing = { type: "batch", actions: [] };
    expect(invertAction(before, { type: "clearEntry", habitId: water.id, day: today })).toEqual(
      nothing,
    );
    expect(invertAction(before, { type: "restoreHabit", id: water.id })).toEqual(nothing);
    expect(
      invertAction(before, {
        type: "setEntry",
        habitId: "unknown" as HabitId,
        day: today,
        value: { kind: "check" },
      }),
    ).toEqual(nothing);
  });

  test("a batch is undone by the inverses in reverse order", () => {
    expect(
      invertAction(before, {
        type: "batch",
        actions: [
          { type: "setEntry", habitId: meditate.id, day: today, value: { kind: "check" } },
          { type: "clearEntry", habitId: meditate.id, day: yesterday },
        ],
      }),
    ).toEqual({
      type: "batch",
      actions: [
        { type: "setEntry", habitId: meditate.id, day: yesterday, value: { kind: "check" } },
        { type: "clearEntry", habitId: meditate.id, day: today },
      ],
    });
  });

  test("the inverse of nested batches is one flat batch", () => {
    expect(
      invertAction(before, {
        type: "batch",
        actions: [
          { type: "clearEntry", habitId: meditate.id, day: yesterday },
          {
            type: "batch",
            actions: [
              { type: "moveHabit", id: water.id, order: "a5" },
              { type: "batch", actions: [{ type: "deleteHabit", id: water.id }] },
            ],
          },
        ],
      }),
    ).toEqual({
      type: "batch",
      actions: [
        { type: "restoreHabit", id: water.id },
        { type: "moveHabit", id: water.id, order: "a0" },
        { type: "setEntry", habitId: meditate.id, day: yesterday, value: { kind: "check" } },
      ],
    });
  });

  const actions: [string, Action][] = [
    [
      "setEntry over an Entry",
      { type: "setEntry", habitId: water.id, day: yesterday, value: { kind: "number", value: 7 } },
    ],
    [
      "setEntry over nothing",
      { type: "setEntry", habitId: water.id, day: today, value: { kind: "number", value: 1 } },
    ],
    ["clearEntry", { type: "clearEntry", habitId: meditate.id, day: yesterday }],
    ["createHabit", { type: "createHabit", habit: textHabit({ name: "Journal", order: "a2" }) }],
    [
      "updateHabit",
      { type: "updateHabit", id: water.id, patch: { name: "H2O", unit: null, target: 10 } },
    ],
    ["moveHabit", { type: "moveHabit", id: meditate.id, order: "Zz" }],
    ["deleteHabit", { type: "deleteHabit", id: water.id }],
    [
      "a batch that writes the same Day twice",
      {
        type: "batch",
        actions: [
          { type: "setEntry", habitId: water.id, day: today, value: { kind: "number", value: 3 } },
          { type: "setEntry", habitId: water.id, day: today, value: { kind: "number", value: 5 } },
        ],
      },
    ],
    [
      "nested batches",
      {
        type: "batch",
        actions: [
          { type: "deleteHabit", id: meditate.id },
          {
            type: "batch",
            actions: [
              { type: "clearEntry", habitId: water.id, day: yesterday },
              { type: "batch", actions: [{ type: "moveHabit", id: water.id, order: "a5" }] },
            ],
          },
          { type: "restoreHabit", id: meditate.id },
        ],
      },
    ],
  ];

  test.each(actions)("undo brings back what the person saw: %s", (_, action) => {
    const after = applyAction(before, action, 50);
    const undone = applyAction(after, invertAction(before, action), 60);
    expect(view(undone)).toEqual(view(before));
  });

  test.each(actions)("undo of the undo brings back the change: %s", (_, action) => {
    const after = applyAction(before, action, 50);
    const undo = invertAction(before, action);
    const undone = applyAction(after, undo, 60);
    const redone = applyAction(undone, invertAction(after, undo), 70);
    expect(view(redone)).toEqual(view(after));
  });
});
