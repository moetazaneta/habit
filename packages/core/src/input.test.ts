import { describe, expect, test } from "vite-plus/test";

import { parseDay, type Day } from "./day";
import type { EntryValue } from "./entry";
import type { HabitId } from "./ids";
import { paintAction, tapResult } from "./input";
import {
  checkHabit,
  choiceHabit,
  numberHabit,
  option,
  scaleHabit,
  textHabit,
} from "./test-fixtures";

const day = (text: string): Day => parseDay(text);
const today = day("2026-10-22");
const tomorrow = day("2026-10-23");

describe("tapResult", () => {
  test("a future Day is locked, for each Kind", () => {
    for (const habit of [checkHabit(), numberHabit(), choiceHabit([option("Legs")]), textHabit()]) {
      expect(tapResult(habit, tomorrow, undefined, today)).toEqual({ type: "locked" });
    }
  });

  test("check: sets an empty Day and clears a filled one", () => {
    const meditate = checkHabit();
    expect(tapResult(meditate, today, undefined, today)).toEqual({
      type: "action",
      action: { type: "setEntry", habitId: meditate.id, day: today, value: { kind: "check" } },
    });
    expect(tapResult(meditate, day("2025-01-01"), { kind: "check" }, today)).toEqual({
      type: "action",
      action: { type: "clearEntry", habitId: meditate.id, day: day("2025-01-01") },
    });
  });

  describe("number", () => {
    const tap = (step: number, current: EntryValue | undefined, target?: number) => {
      const habit = numberHabit({ step, target });
      const result = tapResult(habit, today, current, today);
      return result.type === "action" && result.action.type === "setEntry"
        ? result.action.value
        : result;
    };

    test("adds the Step to the value, from 0 on an empty Day", () => {
      expect(tap(1, undefined)).toEqual({ kind: "number", value: 1 });
      expect(tap(1, { kind: "number", value: 6 })).toEqual({ kind: "number", value: 7 });
      expect(tap(10, { kind: "number", value: 20 }, 30)).toEqual({ kind: "number", value: 30 });
    });

    test("goes on above the Target", () => {
      expect(tap(1, { kind: "number", value: 8 }, 8)).toEqual({ kind: "number", value: 9 });
    });

    test("adds decimal Steps without a rounding error", () => {
      expect(tap(0.5, { kind: "number", value: 7.5 })).toEqual({ kind: "number", value: 8 });
      expect(tap(0.1, { kind: "number", value: 0.2 })).toEqual({ kind: "number", value: 0.3 });
      expect(tap(0.1, { kind: "number", value: 1.7 })).toEqual({ kind: "number", value: 1.8 });
    });

    test("keeps a tiny Step that JavaScript writes in exponent notation", () => {
      expect(tap(1e-7, { kind: "number", value: 0.5 })).toEqual({
        kind: "number",
        value: 0.5000001,
      });
      expect(tap(0.5, { kind: "number", value: 1e-7 })).toEqual({
        kind: "number",
        value: 0.5000001,
      });
    });

    test("writes the Habit and the Day of the tap", () => {
      const water = numberHabit();
      expect(tapResult(water, day("2026-10-20"), undefined, today)).toEqual({
        type: "action",
        action: {
          type: "setEntry",
          habitId: water.id,
          day: day("2026-10-20"),
          value: { kind: "number", value: 1 },
        },
      });
    });
  });

  test("choice, scale and text open the input", () => {
    const habits = [
      choiceHabit([option("Legs")]),
      scaleHabit([option("Low"), option("High")]),
      textHabit(),
    ];
    for (const habit of habits) {
      expect(tapResult(habit, today, undefined, today)).toEqual({ type: "openInput" });
    }
  });
});

describe("paintAction", () => {
  const vitamins = checkHabit();
  const filled = new Set<string>([day("2026-10-19"), day("2026-10-21")]);
  const current = (habitId: HabitId, at: Day): EntryValue | undefined =>
    habitId === vitamins.id && filled.has(at) ? { kind: "check" } : undefined;
  const days = [day("2026-10-19"), day("2026-10-20"), day("2026-10-21"), today, tomorrow];

  test("set: sets each empty Day up to today, and skips the filled and the future Days", () => {
    expect(paintAction(vitamins, days, "set", today, current)).toEqual({
      type: "batch",
      actions: [
        {
          type: "setEntry",
          habitId: vitamins.id,
          day: day("2026-10-20"),
          value: { kind: "check" },
        },
        { type: "setEntry", habitId: vitamins.id, day: today, value: { kind: "check" } },
      ],
    });
  });

  test("clear: clears each filled Day, and skips the empty Days", () => {
    expect(paintAction(vitamins, days, "clear", today, current)).toEqual({
      type: "batch",
      actions: [
        { type: "clearEntry", habitId: vitamins.id, day: day("2026-10-19") },
        { type: "clearEntry", habitId: vitamins.id, day: day("2026-10-21") },
      ],
    });
  });

  test("a Day that the finger passes two times is written once", () => {
    const back = [day("2026-10-20"), today, day("2026-10-20")];
    expect(paintAction(vitamins, back, "set", today, current)).toEqual({
      type: "batch",
      actions: [
        {
          type: "setEntry",
          habitId: vitamins.id,
          day: day("2026-10-20"),
          value: { kind: "check" },
        },
        { type: "setEntry", habitId: vitamins.id, day: today, value: { kind: "check" } },
      ],
    });
  });

  test("without the current Entries, writes each Day up to today", () => {
    expect(paintAction(vitamins, [day("2026-10-21"), today, tomorrow], "clear", today)).toEqual({
      type: "batch",
      actions: [
        { type: "clearEntry", habitId: vitamins.id, day: day("2026-10-21") },
        { type: "clearEntry", habitId: vitamins.id, day: today },
      ],
    });
  });

  test("paints nothing for a Habit that is not a check Habit", () => {
    expect(paintAction(numberHabit(), days, "set", today, current)).toEqual({
      type: "batch",
      actions: [],
    });
  });
});
