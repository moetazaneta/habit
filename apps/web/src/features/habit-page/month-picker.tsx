import type { Month } from "@habit/core";
import { useLayoutEffect, useRef, useState } from "react";

import { ResponsiveSheet } from "@/components/sheet";
import { formatMonth, formatMonthShort } from "@/features/habit-page/months";

export interface MonthPickerProps {
  open: boolean;
  /** The Month of the calendar. */
  month: Month;
  /** The current Month: nothing after it. */
  newest: Month;
  /** The first year in the list of years. */
  oldestYear: number;
  /** The control that opened the picker: the desktop popover points at it. */
  anchor: Element | null;
  /** A month was picked: move the calendar there. The picker closes itself after it. */
  onPick: (month: Month) => void;
  onClose: () => void;
}

/**
 * The Month of the calendar (`?monthPicker=true`): a bottom sheet on a phone, a popover at the
 * month's name on a desktop. The months of a year are at the left, two to a row; the years are at
 * the right, the newest at the bottom, and older years scroll up. A year changes the months on
 * show and keeps the picker open; a month moves the calendar there and closes it. A month after
 * this one cannot be picked.
 *
 * The owner chose this picker to compare it with a calendar that zooms out to its months and years:
 * do not delete it without the owner's approval.
 */
export function MonthPicker({
  open,
  month,
  newest,
  oldestYear,
  anchor,
  onPick,
  onClose,
}: MonthPickerProps) {
  const shownYear = yearOf(month);
  const [year, setYear] = useState(shownYear);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    // Each time it opens, it starts at the year of the calendar.
    if (open) setYear(shownYear);
  }
  const shownMonth = useRef<HTMLButtonElement>(null);

  const newestYear = yearOf(newest);
  const first = Math.min(oldestYear, shownYear);
  const years = Array.from({ length: newestYear - first + 1 }, (_, index) => newestYear - index);
  const months = Array.from(
    { length: 12 },
    (_, index) => `${year}-${String(index + 1).padStart(2, "0")}` as Month,
  );

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      title={formatMonth(month)}
      desktop="popover"
      anchor={anchor}
      initialFocus={(type) => (type === "keyboard" ? (shownMonth.current ?? true) : true)}
    >
      <div className="month-picker">
        <div className="month-picker-months" role="group" aria-label={String(year)}>
          {months.map((candidate) => (
            <button
              key={candidate}
              ref={candidate === month ? shownMonth : undefined}
              type="button"
              className="month-picker-cell"
              aria-label={formatMonth(candidate)}
              aria-current={candidate === month ? "true" : undefined}
              disabled={candidate > newest}
              onClick={() => onPick(candidate)}
            >
              {formatMonthShort(candidate)}
            </button>
          ))}
        </div>
        <YearList years={years} year={year} onYear={setYear} />
      </div>
    </ResponsiveSheet>
  );
}

/**
 * The years, the newest at the bottom, level with the last row of months. The list scrolls up to
 * the older ones, and its top edge fades while there is more above.
 */
function YearList({
  years,
  year,
  onYear,
}: {
  years: number[];
  year: number;
  onYear: (year: number) => void;
}) {
  const list = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState(false);

  const measure = () => {
    const element = list.current;
    if (element === null) return;
    // In a reversed column the bottom is 0 and an upward scroll is negative.
    setMore(-element.scrollTop < element.scrollHeight - element.clientHeight - 1);
  };

  useLayoutEffect(() => {
    const element = list.current;
    if (element === null) return;
    const chosen = element.querySelector<HTMLElement>('[aria-pressed="true"]');
    // An old year of the calendar is above the view: scroll it in.
    const above =
      chosen === null
        ? 0
        : element.getBoundingClientRect().top - chosen.getBoundingClientRect().top;
    if (above > 0) element.scrollTop -= above;
    measure();
  }, []);

  return (
    <div
      ref={list}
      className="month-picker-years"
      role="group"
      aria-label="Years"
      data-more={more ? "" : undefined}
      onScroll={measure}
    >
      {years.map((candidate) => (
        <button
          key={candidate}
          type="button"
          className="month-picker-cell"
          aria-pressed={candidate === year}
          onClick={() => onYear(candidate)}
        >
          {candidate}
        </button>
      ))}
    </div>
  );
}

function yearOf(month: Month): number {
  return Number(month.slice(0, 4));
}
