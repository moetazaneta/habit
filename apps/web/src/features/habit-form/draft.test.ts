import type { Option, OptionId } from "@habit/core";
import { describe, expect, test } from "vite-plus/test";

import { moveOffered, nextColor, parseDecimal, scaleIntensity, tapsToFill } from "./draft";
import { firstEmoji, searchIcons, suggestIcon } from "./icon-search";

const option = (label: string, retired = false): Option => ({
  id: label.toLowerCase() as OptionId,
  label,
  ...(retired ? { retiredAt: 1 } : {}),
});

describe("moveOffered", () => {
  test("moves among the offered options and leaves each retired one in its place", () => {
    const options = [option("Low"), option("Meh", true), option("Okay"), option("Good")];
    const moved = moveOffered(options, 2, 0);
    expect(moved.map((o) => o.label)).toEqual(["Good", "Meh", "Low", "Okay"]);
    // A scale counts the retired option too: its Entries keep their fill.
    expect(scaleIntensity(moved, "meh" as OptionId)).toBe(0.5);
  });
});

describe("tapsToFill", () => {
  test("counts the taps of the step that reach the target", () => {
    expect(tapsToFill({ target: "8", step: "1" })).toBe(8);
    expect(tapsToFill({ target: "7.5", step: "2" })).toBe(4);
    // 4.35 / 1.45 is 3.0000000000000004 in floating point.
    expect(tapsToFill({ target: "4.35", step: "1.45" })).toBe(3);
  });

  test("is null without a target and undefined while a number is not valid", () => {
    expect(tapsToFill({ target: "", step: "1" })).toBeNull();
    expect(tapsToFill({ target: "5", step: "0" })).toBeUndefined();
    expect(tapsToFill({ target: "-1", step: "1" })).toBeUndefined();
  });
});

describe("parseDecimal", () => {
  test("reads a comma or a point, and refuses other text", () => {
    expect(parseDecimal("0,5")).toBe(0.5);
    expect(parseDecimal(" 12.25 ")).toBe(12.25);
    expect(parseDecimal("")).toBeUndefined();
    expect(parseDecimal("1e3")).toBeNaN();
    expect(parseDecimal("ten")).toBeNaN();
  });
});

describe("nextColor", () => {
  test("is the first free color of the palette, else the least used", () => {
    expect(nextColor([])).toBe("rose");
    expect(nextColor([{ color: "rose" }, { color: "ochre" }])).toBe("apricot");
  });
});

describe("icons", () => {
  test("a name suggests an icon by a whole word, then by the start of a word", () => {
    expect(suggestIcon("Drink water")).toEqual({ type: "phosphor", name: "drop" });
    expect(suggestIcon("Gym")).toEqual({ type: "phosphor", name: "barbell" });
    expect(suggestIcon("Vitamins")).toEqual({ type: "phosphor", name: "pill" });
    expect(suggestIcon("Cardio")).toEqual({ type: "phosphor", name: "heartbeat" });
    expect(suggestIcon("Qwzx")).toBeUndefined();
  });

  test("the search finds an icon by the start of its words", () => {
    expect(searchIcons("walk")).toContain("person-simple-walk");
    expect(searchIcons("lang")).toEqual(["translate"]);
  });

  test("an emoji typed into a field is found among other text", () => {
    expect(firstEmoji("abc 🦦 x")).toBe("🦦");
    expect(firstEmoji("🇪🇸")).toBe("🇪🇸");
    expect(firstEmoji("no emoji")).toBeUndefined();
  });
});
