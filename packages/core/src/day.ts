import { notImplemented } from "./internal";

/** A calendar date in the local time of the person, as "YYYY-MM-DD". No time of day, no time zone. */
export type Day = string & { readonly __brand: "Day" };

/** A calendar month, as "YYYY-MM". */
export type Month = string & { readonly __brand: "Month" };

/** Checks the text and returns it as a Day. Throws on anything that is not a real "YYYY-MM-DD" date. */
export function parseDay(text: string): Day {
  return notImplemented(`parseDay(${text})`);
}

/** The Day of a Date in the local time zone of the runtime. */
export function dayOf(date: Date): Day {
  return notImplemented(`dayOf(${date.toISOString()})`);
}

/** Today in the local time zone. */
export function today(now: Date = new Date()): Day {
  return dayOf(now);
}

/** The Day `n` days after `day` (`n` can be negative). */
export function addDays(day: Day, n: number): Day {
  return notImplemented(`addDays(${day}, ${n})`);
}

/** Negative when `a` is before `b`, 0 when equal, positive when after. */
export function compareDays(a: Day, b: Day): number {
  return notImplemented(`compareDays(${a}, ${b})`);
}

/** True when `day` is after `today`. Future Days are locked: no Entry can be set on them. */
export function isFuture(day: Day, today: Day): boolean {
  return compareDays(day, today) > 0;
}

/** The `count` Days that end at `end`, oldest first, so `end` is the last item. */
export function lastDays(end: Day, count: number): Day[] {
  return notImplemented(`lastDays(${end}, ${count})`);
}

/** The weekday of a Day: 0 is Monday, 6 is Sunday. Weeks start on Monday. */
export function weekday(day: Day): number {
  return notImplemented(`weekday(${day})`);
}

/** The Month that contains `day`. */
export function monthOf(day: Day): Month {
  return notImplemented(`monthOf(${day})`);
}

/** The Month `n` months after `month` (`n` can be negative). */
export function addMonths(month: Month, n: number): Month {
  return notImplemented(`addMonths(${month}, ${n})`);
}

/** All Days of a Month, first to last. */
export function daysOfMonth(month: Month): Day[] {
  return notImplemented(`daysOfMonth(${month})`);
}

/**
 * The live window of data: from the first Day of the Month `months - 1` months before the Month
 * of `end`, to `end`. With `months = 13` it covers the 12-month grid plus the current month.
 */
export function liveWindow(end: Day, months: number): { from: Day; to: Day } {
  return notImplemented(`liveWindow(${end}, ${months})`);
}

/**
 * The columns of a GitHub-like grid that ends at `end`: `weeks` columns, oldest first, each with
 * 7 cells from Monday to Sunday. Cells after `end` in the last column are null.
 */
export function gridWeeks(end: Day, weeks: number): (Day | null)[][] {
  return notImplemented(`gridWeeks(${end}, ${weeks})`);
}
