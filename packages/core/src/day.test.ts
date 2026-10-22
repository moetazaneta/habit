import { describe, expect, test } from "vite-plus/test";

import {
  addDays,
  addMonths,
  compareDays,
  dayOf,
  daysOfMonth,
  gridWeeks,
  isFuture,
  lastDays,
  liveWindow,
  monthOf,
  parseDay,
  today,
  weekday,
  type Day,
  type Month,
} from "./day";

const day = (text: string): Day => parseDay(text);
const month = (text: string): Month => text as Month;

describe("dayOf", () => {
  test("gives the local date, not the UTC date", () => {
    // 02:00 UTC on 22 October is 23:00 on 21 October in Santiago (UTC-3).
    expect(dayOf(new Date("2026-10-22T02:00:00Z"))).toBe("2026-10-21");
  });

  test("changes at local midnight, also on the night of a clock change", () => {
    // At the end of 4 April 2026, Santiago's clocks go from 24:00 back to 23:00.
    expect(dayOf(new Date(2026, 3, 4, 23, 59))).toBe("2026-04-04");
    expect(dayOf(new Date(2026, 3, 5, 0, 1))).toBe("2026-04-05");
    // 6 September 2026 has no 00:00 in Santiago: the clocks go from 23:59 to 01:00.
    expect(dayOf(new Date(2026, 8, 5, 23, 59))).toBe("2026-09-05");
    expect(dayOf(new Date(2026, 8, 6, 1, 0))).toBe("2026-09-06");
  });
});

describe("today", () => {
  test("is the local Day of the given time", () => {
    expect(today(new Date(2026, 9, 22, 0, 0))).toBe("2026-10-22");
    expect(today(new Date(2026, 9, 21, 23, 59))).toBe("2026-10-21");
  });
});

describe("parseDay", () => {
  test("accepts a real date", () => {
    expect(parseDay("2026-10-22")).toBe("2026-10-22");
  });

  test("accepts 29 February only in a leap year", () => {
    expect(parseDay("2024-02-29")).toBe("2024-02-29");
    expect(parseDay("2000-02-29")).toBe("2000-02-29");
    expect(() => parseDay("2026-02-29")).toThrow();
    expect(() => parseDay("1900-02-29")).toThrow();
  });

  test.each([
    "2026-04-31",
    "2026-13-01",
    "2026-00-10",
    "2026-10-00",
    "2026-1-5",
    "26-10-22",
    "2026-10-22T00:00",
    " 2026-10-22",
    "",
  ])("rejects %j", (text) => {
    expect(() => parseDay(text)).toThrow();
  });
});

describe("addDays", () => {
  test("crosses the end of a month and of a year", () => {
    expect(addDays(day("2026-01-31"), 1)).toBe("2026-02-01");
    expect(addDays(day("2026-12-31"), 1)).toBe("2027-01-01");
    expect(addDays(day("2027-01-01"), -1)).toBe("2026-12-31");
    expect(addDays(day("2026-03-01"), -1)).toBe("2026-02-28");
  });

  test("knows the leap years", () => {
    expect(addDays(day("2024-02-28"), 1)).toBe("2024-02-29");
    expect(addDays(day("2024-03-01"), -1)).toBe("2024-02-29");
    expect(addDays(day("2024-01-01"), 366)).toBe("2025-01-01");
    expect(addDays(day("2026-01-01"), 365)).toBe("2027-01-01");
  });

  test("counts each Day once over the local clock changes", () => {
    // Santiago goes from UTC-3 back to UTC-4 at the end of 4 April 2026, and forward on 6
    // September 2026.
    expect(addDays(day("2026-04-04"), 1)).toBe("2026-04-05");
    expect(addDays(day("2026-04-05"), -1)).toBe("2026-04-04");
    expect(addDays(day("2026-09-05"), 1)).toBe("2026-09-06");
    expect(addDays(day("2026-09-07"), -1)).toBe("2026-09-06");
    expect(addDays(day("2026-01-01"), 364)).toBe("2026-12-31");
  });

  test("returns the same Day for 0", () => {
    expect(addDays(day("2026-10-22"), 0)).toBe("2026-10-22");
  });
});

describe("compareDays", () => {
  test("orders Days by date", () => {
    expect(compareDays(day("2026-10-21"), day("2026-10-22"))).toBeLessThan(0);
    expect(compareDays(day("2026-10-22"), day("2026-10-22"))).toBe(0);
    expect(compareDays(day("2027-01-01"), day("2026-12-31"))).toBeGreaterThan(0);
  });

  test("sorts a list of Days", () => {
    const days = [day("2026-11-01"), day("2025-12-31"), day("2026-02-09"), day("2026-02-10")];
    expect(days.toSorted(compareDays)).toEqual([
      "2025-12-31",
      "2026-02-09",
      "2026-02-10",
      "2026-11-01",
    ]);
  });
});

describe("isFuture", () => {
  test("locks only the Days after today", () => {
    const today = day("2026-10-22");
    expect(isFuture(day("2026-10-23"), today)).toBe(true);
    expect(isFuture(day("2026-10-22"), today)).toBe(false);
    expect(isFuture(day("2025-10-23"), today)).toBe(false);
  });
});

describe("lastDays", () => {
  test("ends at the given Day, oldest first", () => {
    expect(lastDays(day("2026-10-22"), 5)).toEqual([
      "2026-10-18",
      "2026-10-19",
      "2026-10-20",
      "2026-10-21",
      "2026-10-22",
    ]);
  });

  test("goes back over a month end and a clock change", () => {
    expect(lastDays(day("2026-04-06"), 8)).toEqual([
      "2026-03-30",
      "2026-03-31",
      "2026-04-01",
      "2026-04-02",
      "2026-04-03",
      "2026-04-04",
      "2026-04-05",
      "2026-04-06",
    ]);
  });

  test("gives one Day for 1 and none for 0", () => {
    expect(lastDays(day("2026-10-22"), 1)).toEqual(["2026-10-22"]);
    expect(lastDays(day("2026-10-22"), 0)).toEqual([]);
  });
});

describe("weekday", () => {
  test("starts the week on Monday", () => {
    // 19 October 2026 is a Monday.
    expect(weekday(day("2026-10-19"))).toBe(0);
    expect(weekday(day("2026-10-22"))).toBe(3);
    expect(weekday(day("2026-10-25"))).toBe(6);
    expect(weekday(day("2026-10-26"))).toBe(0);
  });

  test("is right on a leap day and on a clock change", () => {
    expect(weekday(day("2024-02-29"))).toBe(3);
    // Sunday 6 September 2026 starts at 01:00 in Santiago.
    expect(weekday(day("2026-09-06"))).toBe(6);
  });
});

describe("monthOf", () => {
  test("gives the Month of a Day", () => {
    expect(monthOf(day("2026-10-22"))).toBe("2026-10");
    expect(monthOf(day("2024-02-29"))).toBe("2024-02");
  });
});

describe("addMonths", () => {
  test("moves over the ends of years in both directions", () => {
    expect(addMonths(month("2026-10"), 1)).toBe("2026-11");
    expect(addMonths(month("2026-12"), 1)).toBe("2027-01");
    expect(addMonths(month("2026-01"), -1)).toBe("2025-12");
    expect(addMonths(month("2026-10"), -12)).toBe("2025-10");
    expect(addMonths(month("2026-10"), -22)).toBe("2024-12");
    expect(addMonths(month("2026-10"), 0)).toBe("2026-10");
  });
});

describe("daysOfMonth", () => {
  test("lists each Day of the Month in order", () => {
    const days = daysOfMonth(month("2026-10"));
    expect(days).toHaveLength(31);
    expect(days[0]).toBe("2026-10-01");
    expect(days[30]).toBe("2026-10-31");
    expect(days).toEqual(days.toSorted(compareDays));
  });

  test("knows the length of each month", () => {
    expect(daysOfMonth(month("2026-04"))).toHaveLength(30);
    expect(daysOfMonth(month("2026-02"))).toHaveLength(28);
    expect(daysOfMonth(month("2024-02"))).toHaveLength(29);
    expect(daysOfMonth(month("2100-02"))).toHaveLength(28);
    expect(daysOfMonth(month("2000-02"))).toHaveLength(29);
  });

  test("has each Day once in a month with a clock change", () => {
    const days = daysOfMonth(month("2026-04"));
    expect(new Set(days).size).toBe(30);
    expect(days.slice(2, 6)).toEqual(["2026-04-03", "2026-04-04", "2026-04-05", "2026-04-06"]);
  });
});

describe("liveWindow", () => {
  test("covers 12 full months before the current month, up to today", () => {
    expect(liveWindow(day("2026-10-22"), 13)).toEqual({ from: "2025-10-01", to: "2026-10-22" });
    expect(liveWindow(day("2026-01-01"), 13)).toEqual({ from: "2025-01-01", to: "2026-01-01" });
  });

  test("with 1 month, starts at the first Day of the current month", () => {
    expect(liveWindow(day("2024-02-29"), 1)).toEqual({ from: "2024-02-01", to: "2024-02-29" });
  });
});

describe("gridWeeks", () => {
  test("ends with the week of the end Day and leaves its later Days empty", () => {
    // 22 October 2026 is a Thursday.
    expect(gridWeeks(day("2026-10-22"), 2)).toEqual([
      [
        "2026-10-12",
        "2026-10-13",
        "2026-10-14",
        "2026-10-15",
        "2026-10-16",
        "2026-10-17",
        "2026-10-18",
      ],
      ["2026-10-19", "2026-10-20", "2026-10-21", "2026-10-22", null, null, null],
    ]);
  });

  test("fills the last column on a Sunday and has one cell on a Monday", () => {
    expect(gridWeeks(day("2026-10-25"), 1)).toEqual([
      [
        "2026-10-19",
        "2026-10-20",
        "2026-10-21",
        "2026-10-22",
        "2026-10-23",
        "2026-10-24",
        "2026-10-25",
      ],
    ]);
    expect(gridWeeks(day("2026-10-26"), 1)).toEqual([
      ["2026-10-26", null, null, null, null, null, null],
    ]);
  });

  test("a year of columns starts on a Monday and has each Day once, in order", () => {
    const columns = gridWeeks(day("2026-10-22"), 53);
    expect(columns).toHaveLength(53);
    expect(columns.every((column) => column.length === 7)).toBe(true);

    const cells = columns.flat().filter((cell): cell is Day => cell !== null);
    expect(cells[0]).toBe("2025-10-20");
    expect(weekday(cells[0]!)).toBe(0);
    expect(cells.at(-1)).toBe("2026-10-22");
    // Each cell is the Day after the one before it, also over the clock changes and the year end.
    expect(cells.slice(1).every((cell, index) => cell === addDays(cells[index]!, 1))).toBe(true);
    expect(cells).toHaveLength(53 * 7 - 3);
  });
});
