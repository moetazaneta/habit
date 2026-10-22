import {
  addDays,
  entryValue,
  lastDays,
  parseDay,
  validateHabitDraft,
  visibleHabits,
  type EntryValue,
  type Habit,
} from "@habit/core";
import { describe, expect, test } from "vite-plus/test";

import { demoHabitIds, demoState } from "./demoState";

const today = parseDay("2026-10-22");
const state = demoState(today);

function habitNamed(name: string): Habit {
  const habit = visibleHabits(state).find((candidate) => candidate.name === name);
  if (habit === undefined) throw new Error(`no demo habit ${name}`);
  return habit;
}

/** The values of the last 5 Days, oldest first, in the short form of the design sketches. */
function lastFive(name: string): (number | string | boolean | null)[] {
  const habit = habitNamed(name);
  return lastDays(today, 5).map((day) => short(habit, entryValue(state, habit.id, day)));
}

function short(habit: Habit, value: EntryValue | undefined): number | string | boolean | null {
  if (value === undefined) return habit.kind === "check" ? false : null;
  switch (value.kind) {
    case "check":
      return true;
    case "number":
      return value.value;
    case "choice":
    case "scale": {
      const options = habit.kind === "choice" || habit.kind === "scale" ? habit.options : [];
      return options.find((option) => option.id === value.optionId)?.label ?? "?";
    }
    case "text":
      return value.text === "" ? "" : "text";
  }
}

describe("demoState", () => {
  test("has the 11 habits of the design sketches, in their order", () => {
    expect(visibleHabits(state).map((habit) => habit.name)).toEqual([
      "Water",
      "Read",
      "Meditate",
      "Gym",
      "Mood",
      "Sleep",
      "Smoking",
      "Coffee",
      "Journal",
      "Spanish",
      "Vitamins",
    ]);
  });

  test("each habit has the Kind, the fields, the icon and the color of the sketches", () => {
    expect(habitNamed("Water")).toMatchObject({
      kind: "number",
      direction: "build",
      target: 8,
      unit: "glasses",
      step: 1,
      icon: { type: "phosphor", name: "drop" },
      color: "blue",
    });
    expect(habitNamed("Read")).toMatchObject({
      kind: "number",
      target: 30,
      unit: "min",
      step: 10,
      icon: { type: "phosphor", name: "book-open" },
      color: "ochre",
    });
    expect(habitNamed("Meditate")).toMatchObject({
      kind: "check",
      icon: { type: "phosphor", name: "flower-lotus" },
      color: "green",
    });
    expect(habitNamed("Gym")).toMatchObject({
      kind: "choice",
      options: [{ label: "Legs" }, { label: "Push" }, { label: "Pull" }, { label: "Cardio" }],
      icon: { type: "phosphor", name: "barbell" },
      color: "rose",
    });
    expect(habitNamed("Mood")).toMatchObject({
      kind: "scale",
      options: [{ label: "Low" }, { label: "Okay" }, { label: "Good" }, { label: "Great" }],
      icon: { type: "phosphor", name: "smiley" },
      color: "violet",
    });
    expect(habitNamed("Sleep")).toMatchObject({
      kind: "number",
      target: 8,
      unit: "h",
      step: 0.5,
      icon: { type: "phosphor", name: "moon-stars" },
      color: "teal",
    });
    expect(habitNamed("Smoking")).toMatchObject({
      kind: "number",
      direction: "quit",
      target: 5,
      icon: { type: "phosphor", name: "cigarette" },
      color: "slate",
    });
    expect(habitNamed("Coffee")).toMatchObject({
      kind: "number",
      direction: "quit",
      target: 2,
      icon: { type: "phosphor", name: "coffee" },
      color: "sand",
    });
    expect(habitNamed("Journal")).toMatchObject({
      kind: "text",
      icon: { type: "phosphor", name: "notebook" },
      color: "mauve",
    });
    expect(habitNamed("Spanish")).toMatchObject({
      kind: "check",
      icon: { type: "phosphor", name: "translate" },
      color: "sky",
    });
    expect(habitNamed("Vitamins")).toMatchObject({
      kind: "check",
      icon: { type: "phosphor", name: "pill" },
      color: "apricot",
    });
  });

  test("the last 5 Days match the sketches exactly", () => {
    expect(lastFive("Water")).toEqual([8, 6, 8, 3, 5]);
    expect(lastFive("Read")).toEqual([30, null, 30, 20, 10]);
    expect(lastFive("Meditate")).toEqual([true, true, false, true, true]);
    expect(lastFive("Gym")).toEqual(["Legs", null, "Push", null, "Cardio"]);
    expect(lastFive("Mood")).toEqual(["Good", "Okay", "Great", "Low", "Good"]);
    expect(lastFive("Sleep")).toEqual([7.5, 6, 8, 8.5, 7]);
    expect(lastFive("Smoking")).toEqual([3, 5, 2, null, 1]);
    expect(lastFive("Coffee")).toEqual([2, 3, 2, 1, 2]);
    expect(lastFive("Journal")).toEqual(["text", null, "text", "text", null]);
    expect(lastFive("Spanish")).toEqual([true, true, true, false, false]);
    expect(lastFive("Vitamins")).toEqual([true, false, true, true, false]);
  });

  test("has Entries only in the 30 Days that end at today", () => {
    const first = addDays(today, -29);
    for (const entry of Object.values(state.entries)) {
      expect(entry.day >= first && entry.day <= today).toBe(true);
    }
  });

  test("fills the 25 Days before with varied data for each habit", () => {
    const earlier = lastDays(addDays(today, -5), 25);
    for (const habit of visibleHabits(state)) {
      const values = earlier.map((day) => entryValue(state, habit.id, day));
      const filled = values.filter((value) => value !== undefined);
      expect(filled.length, habit.name).toBeGreaterThanOrEqual(8);
      expect(
        new Set(values.map((value) => JSON.stringify(value))).size,
        habit.name,
      ).toBeGreaterThan(1);
    }
  });

  test("is valid data: each habit passes validation and each value has the Kind of its habit", () => {
    for (const habit of visibleHabits(state))
      expect(validateHabitDraft(habit), habit.name).toEqual([]);
    for (const entry of Object.values(state.entries)) {
      expect(entry.value.kind).toBe(state.habits[entry.habitId]?.kind);
      expect(entry.deletedAt).toBeUndefined();
    }
  });

  test("is the same for the same Day, and moves with the Day", () => {
    expect(demoState(today)).toEqual(state);
    const water = demoHabitIds.water;
    const tomorrow = demoState(addDays(today, 1));
    expect(entryValue(tomorrow, water, addDays(today, 1))).toEqual({ kind: "number", value: 5 });
  });

  test("its timestamps are before the start of today, so a real write is always newer", () => {
    const startOfToday = Date.parse(`${addDays(today, -1)}T10:00:00Z`);
    const rows = [...Object.values(state.habits), ...Object.values(state.entries)];
    for (const row of rows) expect(row.updatedAt).toBeLessThan(startOfToday);
  });
});
