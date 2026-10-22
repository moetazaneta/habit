import { describe, expect, test } from "vite-plus/test";

import { intensity } from "./intensity";
import {
  checkHabit,
  choiceHabit,
  numberHabit,
  option,
  optionId,
  scaleHabit,
  textHabit,
} from "./test-fixtures";

const mood = [option("Low"), option("Okay"), option("Good"), option("Great")];

describe("intensity", () => {
  test("is empty without an Entry, for each Kind", () => {
    expect(intensity(checkHabit(), undefined)).toBe(0);
    expect(intensity(numberHabit({ target: 8 }), undefined)).toBe(0);
    expect(intensity(choiceHabit([option("Legs")]), undefined)).toBe(0);
    expect(intensity(scaleHabit(mood), undefined)).toBe(0);
    expect(intensity(textHabit(), undefined)).toBe(0);
  });

  test("check: full when the Entry exists", () => {
    expect(intensity(checkHabit(), { kind: "check" })).toBe(1);
  });

  describe("number", () => {
    const water = numberHabit({ target: 8, unit: "glasses" });

    test("fills value / Target", () => {
      expect(intensity(water, { kind: "number", value: 6 })).toBe(0.75);
      expect(intensity(water, { kind: "number", value: 3 })).toBe(0.375);
      expect(intensity(water, { kind: "number", value: 8 })).toBe(1);
    });

    test("stays full above the Target", () => {
      expect(intensity(water, { kind: "number", value: 12 })).toBe(1);
    });

    test("is empty for 0", () => {
      expect(intensity(water, { kind: "number", value: 0 })).toBe(0);
    });

    test("works with decimals", () => {
      const sleep = numberHabit({ target: 8, step: 0.5 });
      expect(intensity(sleep, { kind: "number", value: 7.5 })).toBe(0.9375);
    });

    test("without a Target: full for any value above 0, empty for 0", () => {
      const pushUps = numberHabit();
      expect(intensity(pushUps, { kind: "number", value: 0.5 })).toBe(1);
      expect(intensity(pushUps, { kind: "number", value: 40 })).toBe(1);
      expect(intensity(pushUps, { kind: "number", value: 0 })).toBe(0);
    });

    test("the Direction changes nothing: a quit Habit fills the same way", () => {
      const smoking = numberHabit({ target: 5, direction: "quit" });
      expect(intensity(smoking, { kind: "number", value: 3 })).toBe(0.6);
      expect(intensity(smoking, { kind: "number", value: 7 })).toBe(1);
    });
  });

  test("choice: full for any Option, also a retired one", () => {
    const gym = choiceHabit([option("Legs"), option("Push", { retiredAt: 5 })]);
    expect(intensity(gym, { kind: "choice", optionId: optionId("Legs") })).toBe(1);
    expect(intensity(gym, { kind: "choice", optionId: optionId("Push") })).toBe(1);
  });

  describe("scale", () => {
    test("the first Option is the lightest and the last is full", () => {
      const habit = scaleHabit(mood);
      const at = (label: string) => intensity(habit, { kind: "scale", optionId: optionId(label) });
      expect([at("Low"), at("Okay"), at("Good"), at("Great")]).toEqual([0.25, 0.5, 0.75, 1]);
    });

    test("a retired Option keeps its position", () => {
      const habit = scaleHabit([
        option("Low"),
        option("Okay", { retiredAt: 5 }),
        option("Good"),
        option("Great"),
      ]);
      expect(intensity(habit, { kind: "scale", optionId: optionId("Okay") })).toBe(0.5);
      expect(intensity(habit, { kind: "scale", optionId: optionId("Good") })).toBe(0.75);
    });

    test("a new order of the Options changes the Intensity", () => {
      const reordered = scaleHabit([
        option("Great"),
        option("Good"),
        option("Okay"),
        option("Low"),
      ]);
      expect(intensity(reordered, { kind: "scale", optionId: optionId("Great") })).toBe(0.25);
    });

    test("an Option that is not in the list counts as the first one", () => {
      expect(intensity(scaleHabit(mood), { kind: "scale", optionId: optionId("Gone") })).toBe(0.25);
    });
  });

  test("text: full when the text is not empty after trimming", () => {
    const journal = textHabit();
    expect(intensity(journal, { kind: "text", text: "Long walk" })).toBe(1);
    expect(intensity(journal, { kind: "text", text: "" })).toBe(0);
    expect(intensity(journal, { kind: "text", text: "  \n " })).toBe(0);
  });

  test("is empty for a value of another Kind", () => {
    expect(intensity(numberHabit({ target: 8 }), { kind: "check" })).toBe(0);
  });
});
