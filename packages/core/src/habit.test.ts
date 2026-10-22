import { describe, expect, test } from "vite-plus/test";

import { createHabit, type HabitDraft } from "./habit";
import { orderBetween } from "./order";
import { option } from "./test-fixtures";

const UUID_V7 = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const water: HabitDraft = {
  kind: "number",
  name: "Water",
  description: "Eight glasses",
  icon: { type: "phosphor", name: "drop" },
  color: "blue",
  direction: "build",
  unit: "glasses",
  target: 8,
  step: 1,
};

describe("createHabit", () => {
  test("adds a new UUIDv7 id and the timestamps to the draft", () => {
    expect(createHabit(water, { now: 50 })).toEqual({
      ...water,
      id: expect.stringMatching(UUID_V7),
      order: expect.any(String),
      createdAt: 50,
      updatedAt: 50,
    });
  });

  test("gives each new Habit its own id", () => {
    expect(createHabit(water, { now: 50 }).id).not.toBe(createHabit(water, { now: 50 }).id);
  });

  test("puts the new Habit after the last one", () => {
    const last = orderBetween(orderBetween());
    expect(createHabit(water, { now: 50, lastOrder: last }).order > last).toBe(true);
  });

  test("keeps the Options of a choice Habit", () => {
    const options = [option("Legs", { emoji: "🦵" }), option("Push")];
    const gym = createHabit({ ...water, kind: "choice", name: "Gym", options }, { now: 50 });
    expect(gym).toMatchObject({ kind: "choice", options });
  });

  test("trims the name and the description", () => {
    const habit = createHabit(
      { ...water, name: "  Water ", description: " Eight glasses\n" },
      { now: 50 },
    );
    expect(habit).toMatchObject({ name: "Water", description: "Eight glasses" });
  });
});
