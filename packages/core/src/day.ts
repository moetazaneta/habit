/** A calendar date in the local time of the person, as "YYYY-MM-DD". No time of day, no time zone. */
export type Day = string & { readonly __brand: "Day" };

/** A calendar month, as "YYYY-MM". */
export type Month = string & { readonly __brand: "Month" };

/** Checks the text and returns it as a Day. Throws on anything that is not a real "YYYY-MM-DD" date. */
export function parseDay(text: string): Day {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (match === null) throw new Error(`@habit/core: not a Day: ${JSON.stringify(text)}`);
  const [year, month, date] = [Number(match[1]), Number(match[2]), Number(match[3])];
  if (month < 1 || month > 12 || date < 1 || date > daysInMonth(year, month)) {
    throw new Error(`@habit/core: not a Day: ${JSON.stringify(text)}`);
  }
  return text as Day;
}

/** The Day of a Date in the local time zone of the runtime. */
export function dayOf(date: Date): Day {
  return formatDay(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

/** Today in the local time zone. */
export function today(now: Date = new Date()): Day {
  return dayOf(now);
}

/** The Day `n` days after `day` (`n` can be negative). */
export function addDays(day: Day, n: number): Day {
  const [year, month, date] = partsOf(day);
  return fromUtc(utc(year, month, date + n));
}

/** Negative when `a` is before `b`, 0 when equal, positive when after. */
export function compareDays(a: Day, b: Day): number {
  // "YYYY-MM-DD" has a fixed width, so the order of the text is the order of the dates.
  return a < b ? -1 : a > b ? 1 : 0;
}

/** True when `day` is after `today`. Future Days are locked: no Entry can be set on them. */
export function isFuture(day: Day, today: Day): boolean {
  return compareDays(day, today) > 0;
}

/** The `count` Days that end at `end`, oldest first, so `end` is the last item. */
export function lastDays(end: Day, count: number): Day[] {
  return Array.from({ length: count }, (_, index) => addDays(end, index - count + 1));
}

/** The weekday of a Day: 0 is Monday, 6 is Sunday. Weeks start on Monday. */
export function weekday(day: Day): number {
  const [year, month, date] = partsOf(day);
  // getUTCDay counts from Sunday (0).
  return (utc(year, month, date).getUTCDay() + 6) % 7;
}

/** The Month that contains `day`. */
export function monthOf(day: Day): Month {
  return day.slice(0, 7) as Month;
}

/** The Month `n` months after `month` (`n` can be negative). */
export function addMonths(month: Month, n: number): Month {
  const index = Number(month.slice(0, 4)) * 12 + Number(month.slice(5, 7)) - 1 + n;
  return `${pad(Math.floor(index / 12), 4)}-${pad((index % 12) + 1, 2)}` as Month;
}

/** All Days of a Month, first to last. */
export function daysOfMonth(month: Month): Day[] {
  const [year, monthNumber] = [Number(month.slice(0, 4)), Number(month.slice(5, 7))];
  return Array.from({ length: daysInMonth(year, monthNumber) }, (_, index) =>
    formatDay(year, monthNumber, index + 1),
  );
}

/**
 * The live window of data: from the first Day of the Month `months - 1` months before the Month
 * of `end`, to `end`. With `months = 13` it covers the 12-month grid plus the current month.
 */
export function liveWindow(end: Day, months: number): { from: Day; to: Day } {
  return { from: `${addMonths(monthOf(end), -(months - 1))}-01` as Day, to: end };
}

/**
 * The columns of a GitHub-like grid that ends at `end`: `weeks` columns, oldest first, each with
 * 7 cells from Monday to Sunday. Cells after `end` in the last column are null.
 */
export function gridWeeks(end: Day, weeks: number): (Day | null)[][] {
  const firstMonday = addDays(end, -weekday(end) - (weeks - 1) * 7);
  return Array.from({ length: weeks }, (_, column) =>
    Array.from({ length: 7 }, (_, row) => {
      const cell = addDays(firstMonday, column * 7 + row);
      return compareDays(cell, end) > 0 ? null : cell;
    }),
  );
}

function formatDay(year: number, month: number, date: number): Day {
  return `${pad(year, 4)}-${pad(month, 2)}-${pad(date, 2)}` as Day;
}

function pad(value: number, length: number): string {
  return String(value).padStart(length, "0");
}

// The Day math runs on UTC dates, which have no clock changes, so each Day is exactly 24 hours.

function partsOf(day: Day): [year: number, month: number, date: number] {
  return [Number(day.slice(0, 4)), Number(day.slice(5, 7)), Number(day.slice(8, 10))];
}

/** A UTC Date; `date` and `month` can overflow, as in `Date.UTC`. */
function utc(year: number, month: number, date: number): Date {
  const result = new Date(0);
  // Unlike `Date.UTC`, `setUTCFullYear` does not read the years 0 to 99 as 1900 to 1999.
  result.setUTCFullYear(year, month - 1, date);
  return result;
}

function fromUtc(date: Date): Day {
  return formatDay(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}

function daysInMonth(year: number, month: number): number {
  // Day 0 of the next month is the last day of this one.
  return utc(year, month + 1, 0).getUTCDate();
}
