import { daysOfMonth, gridWeeks, monthOf, weekday, type Day, type Month } from "@habit/core";

/** The rows of the calendar: weeks are rows, Monday first. */
export const CALENDAR_ROWS = 6;

/**
 * The cells of a Month in the calendar: rows of 7 cells from Monday to Sunday. A cell outside the
 * Month is null. A Month has 4 to 6 rows.
 */
export function monthWeeks(month: Month): (Day | null)[][] {
  const days = daysOfMonth(month);
  const lead = weekday(days[0]!);
  const cells: (Day | null)[] = [...Array.from({ length: lead }, () => null), ...days];
  while (cells.length % 7 !== 0) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, row) => cells.slice(row * 7, row * 7 + 7));
}

/** A Month of the grid of 12 months: the columns whose Monday is in it. */
export interface GridMonth {
  month: Month;
  /** The first column. */
  start: number;
  /** The count of columns. */
  span: number;
}

/** The weeks of the grid of the last 12 months (GitHub-like), and the Months over its columns. */
export interface YearGrid {
  /** Oldest first; each column has 7 cells from Monday to Sunday, null after today. */
  columns: (Day | null)[][];
  months: GridMonth[];
}

/**
 * The grid of the last 12 months: 52 Monday weeks that end with the week of `today`. 52 weeks fit
 * in the live window of 13 months (`liveWindow(today, 13)`), so the grid never waits for data.
 *
 * Each column belongs to the Month of its Monday, so the Months split the grid into whole columns.
 */
export function yearGrid(today: Day, weeks = 52): YearGrid {
  const columns = gridWeeks(today, weeks);
  const months: GridMonth[] = [];
  columns.forEach((column, index) => {
    const month = monthOf(column[0]!);
    const last = months[months.length - 1];
    if (last?.month === month) last.span += 1;
    else months.push({ month, start: index, span: 1 });
  });
  return { columns, months };
}

const monthLong = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" });
const monthShort = new Intl.DateTimeFormat("en", { month: "short" });
const monthNarrow = new Intl.DateTimeFormat("en", { month: "narrow" });

function monthDate(month: Month): Date {
  return new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1, 1);
}

/** "October 2026". */
export function formatMonth(month: Month): string {
  return monthLong.format(monthDate(month));
}

/** "Oct". */
export function formatMonthShort(month: Month): string {
  return monthShort.format(monthDate(month));
}

/** "O". */
export function formatMonthNarrow(month: Month): string {
  return monthNarrow.format(monthDate(month));
}
