import { addDays, weekday, type Day, type EntryValue, type Habit } from "@habit/core";

/** The local Date at the start of a Day. */
export function dayDate(day: Day): Date {
  const [year, month, date] = day.split("-").map(Number) as [number, number, number];
  return new Date(year, month - 1, date);
}

const longDay = new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" });

/** "Thursday, October 22". */
export function formatDayLong(day: Day): string {
  return longDay.format(dayDate(day));
}

/** "Today", "Yesterday", or "Thursday, October 22". */
export function formatDayRelative(day: Day, today: Day): string {
  if (day === today) return "Today";
  if (day === addDays(today, -1)) return "Yesterday";
  return formatDayLong(day);
}

const WEEKDAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"] as const;

/** The weekday letter of a Day, Monday first: "M", "T", "W", "T", "F", "S", "S". */
export function weekdayLetter(day: Day): string {
  return WEEKDAY_LETTERS[weekday(day)]!;
}

/** The date in the month: "22". */
export function dayOfMonth(day: Day): string {
  return String(Number(day.slice(8)));
}

const numberFormat = new Intl.NumberFormat("en", { maximumFractionDigits: 3 });

/** A number for people: "1.5", "1,200". */
export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

/** A number with its unit: "1.5 L", "8". */
export function formatQuantity(value: number, unit?: string): string {
  return unit === undefined || unit === "" ? formatNumber(value) : `${formatNumber(value)} ${unit}`;
}

/** The Entry in words, for screen readers and titles: "done", "3 of 8 glasses", "Good". */
export function describeEntry(habit: Habit, value: EntryValue | undefined): string {
  if (value === undefined) return "no entry";
  switch (value.kind) {
    case "check":
      return "done";
    case "number": {
      if (habit.kind !== "number") return formatNumber(value.value);
      const amount = formatQuantity(value.value, habit.unit);
      return habit.target === undefined
        ? amount
        : `${formatNumber(value.value)} of ${formatQuantity(habit.target, habit.unit)}`;
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
