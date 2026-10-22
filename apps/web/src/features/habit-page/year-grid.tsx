import {
  intensity,
  type Day,
  type EntryValue,
  type Habit,
  type HabitId,
  type Month,
} from "@habit/core";
import { useMemo, type CSSProperties } from "react";

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
 * moves the calendar to that Month.
 */
export function YearGrid({ habit, today, entries, month, onSelectMonth }: YearGridProps) {
  const grid = useMemo(() => yearGrid(today), [today]);
  return (
    <section className="hp-year" aria-label="The last 12 months">
      <div className="hp-year-inner" style={{ "--weeks": grid.columns.length } as CSSProperties}>
        <div className="hp-year-grid" aria-hidden>
          {grid.columns.map((column) =>
            column.map((day, row) => {
              if (day === null) return <span key={`${column[0]}-${row}`} />;
              const value = entries(habit.id, day);
              // DaySquare is memoized: a change of one Day renders one square, not 364.
              return (
                <DaySquare
                  key={day}
                  color={habit.color}
                  intensity={intensity(habit, value)}
                  recorded={value !== undefined}
                  size="var(--cell)"
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
