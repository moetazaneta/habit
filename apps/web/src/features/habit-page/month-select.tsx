import type { Month } from "@habit/core";
import { CaretDownIcon } from "@phosphor-icons/react/dist/csr/CaretDown";
import type { ChangeEvent } from "react";

import { formatMonthName } from "@/features/habit-page/months";

const MONTHS = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0"));

export interface MonthSelectProps {
  /** The Month of the calendar. */
  month: Month;
  /** The current Month: nothing after it. */
  newest: Month;
  /** The first year in the list of years. */
  oldestYear: number;
  onChange: (month: Month) => void;
}

/**
 * The Month of the calendar as two native selects, the month and the year, each drawn as a pill
 * with its value. A phone opens its own picker at the bottom of the screen. A year that has no
 * such month yet (the current one) goes to its newest Month.
 */
export function MonthSelect({ month, newest, oldestYear, onChange }: MonthSelectProps) {
  const year = Number(month.slice(0, 4));
  const newestYear = Number(newest.slice(0, 4));
  const first = Math.min(oldestYear, year);
  const years = Array.from({ length: newestYear - first + 1 }, (_, index) => first + index);

  const go = (next: Month) => onChange(next > newest ? newest : next);

  return (
    <div className="hp-pick">
      <label className="hp-select">
        <span className="hp-select-value" aria-hidden>
          {formatMonthName(month)}
        </span>
        <CaretDownIcon weight="bold" aria-hidden />
        <select
          aria-label="Month"
          value={month.slice(5, 7)}
          onChange={(event: ChangeEvent<HTMLSelectElement>) =>
            go(`${year}-${event.target.value}` as Month)
          }
        >
          {MONTHS.map((mm) => (
            <option key={mm} value={mm} disabled={`${year}-${mm}` > newest}>
              {formatMonthName(`${year}-${mm}` as Month)}
            </option>
          ))}
        </select>
      </label>
      <label className="hp-select">
        <span className="hp-select-value" aria-hidden>
          {year}
        </span>
        <CaretDownIcon weight="bold" aria-hidden />
        <select
          aria-label="Year"
          value={year}
          onChange={(event: ChangeEvent<HTMLSelectElement>) =>
            go(`${event.target.value}-${month.slice(5, 7)}` as Month)
          }
        >
          {years.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
