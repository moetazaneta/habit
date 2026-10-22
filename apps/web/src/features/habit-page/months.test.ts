import { type Day, type Month } from "@habit/core";
import { expect, test } from "vite-plus/test";

import { monthWeeks, yearGrid } from "@/features/habit-page/months";

test("a Month's weeks start on Monday, with blanks outside the Month", () => {
  // October 2026 starts on a Thursday and ends on a Saturday.
  const weeks = monthWeeks("2026-10" as Month);
  expect(weeks).toHaveLength(5);
  expect(weeks[0]).toEqual([
    null,
    null,
    null,
    "2026-10-01",
    "2026-10-02",
    "2026-10-03",
    "2026-10-04",
  ]);
  expect(weeks[4]).toEqual([
    "2026-10-26",
    "2026-10-27",
    "2026-10-28",
    "2026-10-29",
    "2026-10-30",
    "2026-10-31",
    null,
  ]);
  // February 2027 starts on a Monday and has exactly 4 weeks; August 2027 needs 6.
  expect(monthWeeks("2027-02" as Month)).toHaveLength(4);
  expect(monthWeeks("2027-08" as Month)).toHaveLength(6);
});

test("the grid has 52 weeks that end with the week of today, split into whole Months", () => {
  const grid = yearGrid("2026-10-22" as Day);

  expect(grid.columns).toHaveLength(52);
  expect(grid.columns[51]).toEqual([
    "2026-10-19",
    "2026-10-20",
    "2026-10-21",
    "2026-10-22",
    null,
    null,
    null,
  ]);
  // Each column belongs to the Month of its Monday: the first one, 27 October 2025, is the only
  // column of October 2025.
  expect(grid.months[0]).toEqual({ month: "2025-10", start: 0, span: 1 });
  // October 2026 has the Mondays 5, 12 and 19: the week of 28 September belongs to September.
  expect(grid.months.at(-1)).toEqual({ month: "2026-10", start: 49, span: 3 });
  expect(grid.months.map((month) => month.month)).toHaveLength(13);
  expect(grid.months.reduce((columns, month) => columns + month.span, 0)).toBe(52);
});
