import {
  createHabit,
  emptyState,
  entryKey,
  lastDays,
  type Day,
  type EntryValue,
  type Habit,
  type HabitDraft,
  type HabitState,
  type OptionId,
} from "@habit/core";
import { demoState } from "@habit/data/testing";

/**
 * Dev-only datasets for the fake provider, chosen with `?data=` (break-ui): the demo data, the
 * realistic worst case, no habits, one habit, and many habits. Never part of a real build: main.tsx
 * loads this module only in fake mode.
 */
export const DEV_DATASETS = ["demo", "worst", "empty", "one", "many"] as const;
export type DevDataset = (typeof DEV_DATASETS)[number];

export function isDevDataset(value: string | null): value is DevDataset {
  return (DEV_DATASETS as readonly string[]).includes(value ?? "");
}

export function devDataset(name: DevDataset, today: Day): HabitState {
  switch (name) {
    case "demo":
      return demoState(today);
    case "empty":
      return emptyState();
    case "one":
      return build(today, WORST.slice(1, 2));
    case "worst":
      return build(today, WORST);
    case "many":
      return build(today, Array.from({ length: 4 }, () => WORST).flat());
  }
}

interface Fixture {
  draft: HabitDraft;
  /** The value of the Day `daysAgo` Days before today, or undefined for no Entry. */
  value: (daysAgo: number) => EntryValue | undefined;
}

const base = { description: "", direction: "build" as const };
const option = (id: string, label: string, emoji?: string) => ({
  id: id as OptionId,
  label,
  ...(emoji === undefined ? {} : { emoji }),
});

/** Each row breaks something different, as real data does. */
const WORST: Fixture[] = [
  {
    // The longest name the validation accepts: 60 characters.
    draft: {
      ...base,
      kind: "check",
      name: "Stretch hamstrings and lower back before bed, then floss too",
      icon: { type: "phosphor", name: "person-simple-tai-chi" },
      color: "jade",
    },
    value: (ago) => (ago % 3 === 0 ? undefined : { kind: "check" }),
  },
  {
    // One letter, and an emoji made of several code points.
    draft: {
      ...base,
      kind: "check",
      name: "X",
      icon: { type: "emoji", emoji: "🧘🏽‍♀️" },
      color: "rose",
    },
    value: (ago) => (ago % 2 === 0 ? { kind: "check" } : undefined),
  },
  {
    // Large numbers with decimals and a long unit, above the Target.
    draft: {
      ...base,
      kind: "number",
      name: "Steps",
      icon: { type: "phosphor", name: "sneaker-move" },
      color: "olive",
      unit: "steps on the pedometer",
      target: 10000,
      step: 1000,
    },
    value: (ago) => ({ kind: "number", value: [12345.678, 0, 9999.5, 250, 1000000][ago % 5]! }),
  },
  {
    // A quit habit with a recorded zero: a clean day is data, not an empty Day.
    draft: {
      ...base,
      kind: "number",
      direction: "quit",
      name: "Сигареты",
      icon: { type: "phosphor", name: "cigarette" },
      color: "slate",
      target: 5,
      step: 1,
    },
    value: (ago) => ({ kind: "number", value: [0, 2, 0, 7, 1][ago % 5]! }),
  },
  {
    // A name in a script without spaces, and an icon that is not in the catalog.
    draft: {
      ...base,
      kind: "number",
      name: "日本語の勉強をする時間",
      icon: { type: "phosphor", name: "unicorn" },
      color: "violet",
      unit: "min",
      step: 0.25,
    },
    value: (ago) => (ago % 4 === 0 ? undefined : { kind: "number", value: ago * 0.25 }),
  },
  {
    // Twelve Options with long labels, one of them retired but used.
    draft: {
      ...base,
      kind: "choice",
      name: "Workout",
      icon: { type: "phosphor", name: "barbell" },
      color: "raspberry",
      options: [
        option("o1", "High-intensity interval training on the rowing machine", "🚣"),
        option("o2", "Legs", "🦵"),
        option("o3", "Push"),
        option("o4", "Pull", "🧗"),
        option("o5", "Yoga", "🧘"),
        option("o6", "Swim", "🏊"),
        option("o7", "Bike", "🚴"),
        option("o8", "Run", "🏃"),
        option("o9", "Climb", "🧗"),
        option("o10", "Walk", "🚶"),
        option("o11", "Mobility and foam rolling", "🧻"),
        { ...option("o12", "Old program", "📦"), retiredAt: 1 },
      ],
    },
    value: (ago) => ({ kind: "choice", optionId: `o${(ago % 12) + 1}` as OptionId }),
  },
  {
    // A scale with five steps; an Arabic name in a left-to-right layout.
    draft: {
      ...base,
      kind: "scale",
      name: "مزاج اليوم",
      icon: { type: "phosphor", name: "smiley" },
      color: "mauve",
      options: [
        option("s1", "Awful"),
        option("s2", "Low"),
        option("s3", "Okay"),
        option("s4", "Good"),
        option("s5", "Great"),
      ],
    },
    value: (ago) =>
      ago % 6 === 5 ? undefined : { kind: "scale", optionId: `s${(ago % 5) + 1}` as OptionId },
  },
  {
    // A long note with a URL and no break opportunities, and an empty Day.
    draft: {
      ...base,
      kind: "text",
      name: "Supercalifragilisticexpialidocious-gratitude-journal",
      icon: { type: "phosphor", name: "notebook" },
      color: "ochre",
    },
    value: (ago) =>
      ago % 2 === 1
        ? undefined
        : {
            kind: "text",
            text:
              "Walked to https://www.example.com/a/really/long/path/that/never/breaks/anywhere-at-all " +
              "and back. Long call with Aleksandra Wiśniewska-Kowalczyk about the move; slept badly. ".repeat(
                3,
              ),
          },
  },
];

function build(today: Day, fixtures: Fixture[]): HabitState {
  const state: HabitState = { habits: {}, entries: {} };
  let lastOrder: string | undefined;
  for (const fixture of fixtures) {
    const habit: Habit = createHabit(fixture.draft, {
      now: 0,
      ...(lastOrder === undefined ? {} : { lastOrder }),
    });
    lastOrder = habit.order;
    state.habits[habit.id] = habit;
    for (const day of lastDays(today, 30)) {
      const ago = Math.round((Date.parse(today) - Date.parse(day)) / 86_400_000);
      const value = fixture.value(ago);
      if (value !== undefined)
        state.entries[entryKey(habit.id, day)] = { habitId: habit.id, day, value, updatedAt: 0 };
    }
  }
  return state;
}
