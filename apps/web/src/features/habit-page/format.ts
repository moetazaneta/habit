import type { Day, EntryValue, Habit } from "@habit/core";

// The words of a Day and of an Entry, for screen readers. The same signatures as
// `@/components/format` of the list milestone: switch to it when it is on main.

function dayDate(day: Day): Date {
  const [year, month, date] = day.split("-").map(Number) as [number, number, number];
  return new Date(year, month - 1, date);
}

const longDay = new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" });

/** "Thursday, October 22". */
export function formatDayLong(day: Day): string {
  return longDay.format(dayDate(day));
}

/** The date in the month: "22". */
export function dayOfMonth(day: Day): string {
  return String(Number(day.slice(8)));
}

const numberFormat = new Intl.NumberFormat("en", { maximumFractionDigits: 3 });

function formatQuantity(value: number, unit?: string): string {
  const number = numberFormat.format(value);
  return unit === undefined || unit === "" ? number : `${number} ${unit}`;
}

/** The Entry in words: "done", "3 of 8 glasses", "Good", "no entry". */
export function describeEntry(habit: Habit, value: EntryValue | undefined): string {
  if (value === undefined) return "no entry";
  switch (value.kind) {
    case "check":
      return "done";
    case "number": {
      if (habit.kind !== "number") return numberFormat.format(value.value);
      return habit.target === undefined
        ? formatQuantity(value.value, habit.unit)
        : `${numberFormat.format(value.value)} of ${formatQuantity(habit.target, habit.unit)}`;
    }
    case "choice":
    case "scale": {
      if (habit.kind !== "choice" && habit.kind !== "scale") return "an option";
      return habit.options.find((option) => option.id === value.optionId)?.label ?? "an option";
    }
    case "text":
      return value.text.trim() === "" ? "no entry" : value.text;
  }
}
