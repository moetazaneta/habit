import {
  intensity,
  type Day,
  type EntryValue,
  type Habit,
  type HabitId,
  type Month,
} from "@habit/core";
import { useMemo, useState, type CSSProperties, type KeyboardEvent } from "react";

import { DaySquare } from "@/components/day-square";
import {
  formatMonth,
  formatMonthNarrow,
  formatMonthShort,
  yearGrid,
} from "@/features/habit-page/months";

/** A Month gets its short name over the grid only when it has this many columns. */
const LABEL_MIN_COLUMNS = 3;

export interface YearGridProps {
  habit: Habit;
  today: Day;
  entries: (habitId: HabitId, day: Day) => EntryValue | undefined;
  /** The Month that the calendar shows. */
  month: Month;
  onSelectMonth: (month: Month) => void;
}

/**
 * The last 12 months as a GitHub-like grid: a column for each week, Monday at the top, small
 * gauges in the habit color. It takes no input, but each Month over its columns is a button that
 * moves the calendar to that Month. The Months are one Tab stop: the arrows move between them.
 */
export function YearGrid({ habit, today, entries, month, onSelectMonth }: YearGridProps) {
  const grid = useMemo(() => yearGrid(today), [today]);
  const [focused, setFocused] = useState<Month | null>(null);
  const months = grid.months.map((region) => region.month);
  const tabStop =
    [focused, month].find((candidate) => candidate !== null && months.includes(candidate)) ??
    months.at(-1);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = months.indexOf((event.target as HTMLElement).dataset.month as Month);
    if (index < 0) return;
    const next =
      event.key === "ArrowLeft"
        ? index - 1
        : event.key === "ArrowRight"
          ? index + 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? months.length - 1
              : null;
    if (next === null) return;
    event.preventDefault();
    const destination = months[Math.min(Math.max(next, 0), months.length - 1)]!;
    setFocused(destination);
    event.currentTarget
      .querySelector<HTMLElement>(`[data-month="${destination}"]`)
      ?.focus({ preventScroll: true });
  };

  return (
    <section className="hp-year" aria-label="The last 12 months">
      <div
        className="hp-year-inner"
        style={{ "--weeks": grid.columns.length } as CSSProperties}
        onKeyDown={onKeyDown}
      >
        <div className="hp-year-grid" aria-hidden>
          {grid.columns.map((column) =>
            column.map((day, row) => {
              if (day === null) return <span key={`${column[0]}-${row}`} />;
              const value = entries(habit.id, day);
              // DaySquare is memoized: a change of one Day renders one square, not 364. A grid
              // this large does not animate: a new Target would pulse every square at once.
              return (
                <DaySquare
                  key={day}
                  color={habit.color}
                  intensity={intensity(habit, value)}
                  recorded={value !== undefined}
                  size="var(--cell)"
                  animated={false}
                />
              );
            }),
          )}
        </div>
        {grid.months.map((region) => (
          <button
            key={region.month}
            type="button"
            className="hp-year-month"
            data-month={region.month}
            tabIndex={region.month === tabStop ? 0 : -1}
            style={{ "--start": region.start, "--span": region.span } as CSSProperties}
            aria-label={formatMonth(region.month)}
            aria-current={region.month === month ? "true" : undefined}
            onClick={() => onSelectMonth(region.month)}
          >
            {region.span >= LABEL_MIN_COLUMNS ? (
              <span className="hp-year-month-label" aria-hidden>
                <span className="hp-year-month-short">{formatMonthShort(region.month)}</span>
                <span className="hp-year-month-narrow">{formatMonthNarrow(region.month)}</span>
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </section>
  );
}
