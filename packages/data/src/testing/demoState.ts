import {
  addDays,
  entryKey,
  lastDays,
  orderBetween,
  weekday,
  type Day,
  type Entry,
  type EntryValue,
  type Habit,
  type HabitDraft,
  type HabitId,
  type HabitState,
  type OptionId,
} from "@habit/core";

const id = (index: number) =>
  `019a0000-0000-7000-8000-${String(index).padStart(12, "0")}` as HabitId;

/** The fixed ids of the demo habits, so that a test or a link can name one. */
export const demoHabitIds = {
  water: id(1),
  read: id(2),
  meditate: id(3),
  gym: id(4),
  mood: id(5),
  sleep: id(6),
  smoking: id(7),
  coffee: id(8),
  journal: id(9),
  spanish: id(10),
  vitamins: id(11),
};

type DemoKey = keyof typeof demoHabitIds;

/** The value of a Day before the last 5, from a random number generator with a fixed seed. */
type Fill = (random: Random, day: Day, daysAgo: number) => EntryValue | undefined;

interface DemoHabit {
  key: DemoKey;
  draft: HabitDraft;
  /** The last 5 Days, oldest first, as in the design sketches. undefined: no Entry. */
  recent: (EntryValue | undefined)[];
  earlier: Fill;
}

const done = { kind: "check" } as const;
const number = (value: number): EntryValue => ({ kind: "number", value });
const choice = (optionId: string): EntryValue => ({
  kind: "choice",
  optionId: optionId as OptionId,
});
const scale = (optionId: string): EntryValue => ({ kind: "scale", optionId: optionId as OptionId });
const text = (value: string): EntryValue => ({ kind: "text", text: value });
const option = (optionId: string, label: string, emoji: string) => ({
  id: optionId as OptionId,
  label,
  emoji,
});

const common = { description: "", direction: "build" } as const;

/** Gym days of the week (0 is Monday). */
const GYM_PLAN: Record<number, string> = { 0: "legs", 2: "push", 4: "pull", 5: "cardio" };

const NOTES = [
  "Slow morning, good coffee.",
  "Rain all day. Stayed in and cooked.",
  "Long call with Mom.",
  "Tried the climbing gym near the station.",
  "Tired, but the walk helped.",
  "Fixed the bike at last.",
  "Read in the park until sunset.",
  "Busy day at work, early night.",
  "Baked bread for the first time.",
  "Lunch with Sam.",
  "A quiet day.",
  "Cleaned the flat and felt better.",
];

const DEMO_HABITS: DemoHabit[] = [
  {
    key: "water",
    draft: {
      ...common,
      kind: "number",
      name: "Water",
      description: "Eight glasses a day",
      icon: { type: "phosphor", name: "drop" },
      color: "blue",
      unit: "glasses",
      target: 8,
      step: 1,
    },
    recent: [number(8), number(6), number(8), number(3), number(5)],
    earlier: (random) => (random.chance(0.92) ? number(random.int(4, 10)) : undefined),
  },
  {
    key: "read",
    draft: {
      ...common,
      kind: "number",
      name: "Read",
      description: "Thirty minutes of a book",
      icon: { type: "phosphor", name: "book-open" },
      color: "ochre",
      unit: "min",
      target: 30,
      step: 10,
    },
    recent: [number(30), undefined, number(30), number(20), number(10)],
    earlier: (random) => (random.chance(0.7) ? number(10 * random.int(1, 5)) : undefined),
  },
  {
    key: "meditate",
    draft: {
      ...common,
      kind: "check",
      name: "Meditate",
      description: "Ten quiet minutes",
      icon: { type: "phosphor", name: "flower-lotus" },
      color: "green",
    },
    recent: [done, done, undefined, done, done],
    earlier: (random) => (random.chance(0.75) ? done : undefined),
  },
  {
    key: "gym",
    draft: {
      ...common,
      kind: "choice",
      name: "Gym",
      icon: { type: "phosphor", name: "barbell" },
      color: "rose",
      options: [
        option("legs", "Legs", "🦵"),
        option("push", "Push", "💪"),
        option("pull", "Pull", "🧗"),
        option("cardio", "Cardio", "🏃"),
      ],
    },
    recent: [choice("legs"), undefined, choice("push"), undefined, choice("cardio")],
    earlier: (random, day) => {
      const planned = GYM_PLAN[weekday(day)];
      return planned !== undefined && random.chance(0.8) ? choice(planned) : undefined;
    },
  },
  {
    key: "mood",
    draft: {
      ...common,
      kind: "scale",
      name: "Mood",
      description: "How the day felt",
      icon: { type: "phosphor", name: "smiley" },
      color: "violet",
      options: [
        option("low", "Low", "😞"),
        option("okay", "Okay", "😐"),
        option("good", "Good", "🙂"),
        option("great", "Great", "😄"),
      ],
    },
    recent: [scale("good"), scale("okay"), scale("great"), scale("low"), scale("good")],
    earlier: (random) => {
      if (!random.chance(0.9)) return undefined;
      const roll = random.next();
      return scale(roll < 0.1 ? "low" : roll < 0.4 ? "okay" : roll < 0.8 ? "good" : "great");
    },
  },
  {
    key: "sleep",
    draft: {
      ...common,
      kind: "number",
      name: "Sleep",
      description: "Hours in bed, lights off",
      icon: { type: "phosphor", name: "moon-stars" },
      color: "teal",
      unit: "h",
      target: 8,
      step: 0.5,
    },
    recent: [number(7.5), number(6), number(8), number(8.5), number(7)],
    earlier: (random) => (random.chance(0.95) ? number(5.5 + 0.5 * random.int(0, 7)) : undefined),
  },
  {
    key: "smoking",
    draft: {
      ...common,
      kind: "number",
      name: "Smoking",
      description: "Five a day at most",
      direction: "quit",
      icon: { type: "phosphor", name: "cigarette" },
      color: "slate",
      target: 5,
      step: 1,
    },
    recent: [number(3), number(5), number(2), undefined, number(1)],
    // Fewer each week: about 7 a month ago, about 3 a week ago.
    earlier: (random, _day, daysAgo) => {
      if (!random.chance(0.9)) return undefined;
      const trend = 3 + Math.round(((daysAgo - 5) / 24) * 4);
      return number(Math.max(0, trend + random.int(-1, 1)));
    },
  },
  {
    key: "coffee",
    draft: {
      ...common,
      kind: "number",
      name: "Coffee",
      direction: "quit",
      icon: { type: "phosphor", name: "coffee" },
      color: "sand",
      target: 2,
      step: 1,
    },
    recent: [number(2), number(3), number(2), number(1), number(2)],
    earlier: (random) => (random.chance(0.95) ? number(random.int(1, 4)) : undefined),
  },
  {
    key: "journal",
    draft: {
      ...common,
      kind: "text",
      name: "Journal",
      description: "One line about the day",
      icon: { type: "phosphor", name: "notebook" },
      color: "mauve",
    },
    recent: [
      text("Walked to work. The air was cold and clear."),
      undefined,
      text("Dinner with Anna, too much pasta."),
      text("Finished the first chapter of the new book."),
      undefined,
    ],
    earlier: (random) => (random.chance(0.6) ? text(random.pick(NOTES)) : undefined),
  },
  {
    key: "spanish",
    draft: {
      ...common,
      kind: "check",
      name: "Spanish",
      description: "One lesson",
      icon: { type: "phosphor", name: "translate" },
      color: "sky",
    },
    recent: [done, done, done, undefined, undefined],
    earlier: (random) => (random.chance(0.65) ? done : undefined),
  },
  {
    key: "vitamins",
    draft: {
      ...common,
      kind: "check",
      name: "Vitamins",
      description: "With breakfast",
      icon: { type: "phosphor", name: "pill" },
      color: "apricot",
    },
    recent: [done, undefined, done, done, undefined],
    earlier: (random) => (random.chance(0.7) ? done : undefined),
  },
];

/**
 * The demo data of the design sketches: 11 habits (Water, Read, Meditate, Gym, Mood, Sleep,
 * Smoking, Coffee, Journal, Spanish, Vitamins) with Entries for the 30 Days that end at `today`.
 * The last 5 Days are those of the sketches; the 25 Days before them come from a random number
 * generator with a fixed seed, so the same `today` always gives the same data. Each timestamp is
 * 40 days before `today`, so a real write is always newer.
 */
export function demoState(today: Day): HabitState {
  const time = Date.parse(`${addDays(today, -40)}T00:00:00Z`);
  const state: HabitState = { habits: {}, entries: {} };
  let order: string | undefined;

  DEMO_HABITS.forEach(({ key, draft, recent, earlier }, index) => {
    const habitId = demoHabitIds[key];
    order = orderBetween(order);
    const habit: Habit = { ...draft, id: habitId, order, createdAt: time, updatedAt: time };
    state.habits[habitId] = habit;

    const random = new Random(index + 1);
    const days = lastDays(today, 30);
    days.forEach((day, dayIndex) => {
      const daysAgo = days.length - 1 - dayIndex;
      const value =
        daysAgo < recent.length
          ? recent[recent.length - 1 - daysAgo]
          : earlier(random, day, daysAgo);
      if (value === undefined) return;
      const entry: Entry = { habitId, day, value, updatedAt: time };
      state.entries[entryKey(habitId, day)] = entry;
    });
  });
  return state;
}

/** A small random number generator with a seed (mulberry32), so the demo data never changes. */
class Random {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed >>> 0;
  }

  /** A number from 0 (inclusive) to 1 (exclusive). */
  next(): number {
    this.seed = (this.seed + 0x6d2b79f5) >>> 0;
    let t = this.seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  chance(probability: number): boolean {
    return this.next() < probability;
  }

  /** An integer from `min` to `max`, both inclusive. */
  int(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1));
  }

  pick<T>(items: readonly T[]): T {
    return items[this.int(0, items.length - 1)]!;
  }
}
