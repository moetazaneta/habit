import { monthOf, type Habit, type HabitId, type Month } from "@habit/core";
import { useEntries, useHabit, useHabits } from "@habit/data";
import { CaretLeftIcon } from "@phosphor-icons/react/dist/csr/CaretLeft";
import { Link, useCanGoBack, useRouter } from "@tanstack/react-router";
import { useState, type MouseEvent, type ReactNode } from "react";

import { DaySquare } from "@/components/day-square";
import { HabitIcon } from "@/components/habit-icon";
import { habitColorStyle } from "@/components/palette";
import { useOpenSheet } from "@/components/sheet-search";
import { MonthCalendar } from "@/features/habit-page/month-calendar";
import { useToday } from "@/features/habit-page/use-today";
import { YearGrid } from "@/features/habit-page/year-grid";

import "@/features/habit-page/habit-page.css";

/**
 * The page of a habit (`/habits/$habitId`): the icon and the name, a grid of the last 12 months,
 * and a calendar with one Month per page. A tap on a Month in the grid moves the calendar there.
 */
export function HabitPage({ habitId }: { habitId: HabitId }) {
  const habit = useHabit(habitId);
  const { source } = useHabits();

  if (source === "none") return <PageSkeleton />;
  if (habit === undefined || habit.deletedAt !== undefined) return <MissingHabit />;
  return <HabitDetail habit={habit} />;
}

function HabitDetail({ habit }: { habit: Habit }) {
  const today = useToday();
  const entries = useEntries();
  const openSheet = useOpenSheet();
  const [month, setMonth] = useState<Month>(() => monthOf(today));

  return (
    <main className="habit-page" style={habitColorStyle(habit.color)}>
      <PageBar>
        <button type="button" className="hp-bar-text" onClick={() => openSheet({ edit: habit.id })}>
          Edit
        </button>
      </PageBar>
      <header className="hp-identity">
        <HabitIcon icon={habit.icon} color={habit.color} size="var(--hp-icon)" />
        <h1 className="hp-name">{habit.name}</h1>
      </header>
      {habit.description.trim() === "" ? null : (
        <p className="hp-description">{habit.description}</p>
      )}
      <YearGrid
        habit={habit}
        today={today}
        entries={entries}
        month={month}
        onSelectMonth={setMonth}
      />
      <MonthCalendar habit={habit} today={today} month={month} onMonthChange={setMonth} />
    </main>
  );
}

/**
 * The bar at the top: back to the list at the left, the page's own control at the right. Back
 * goes back in the history when the app came from the list, so the list keeps its scroll; after a
 * reload or from a link, it goes to `/`.
 */
function PageBar({ children }: { children?: ReactNode }) {
  const canGoBack = useCanGoBack();
  const router = useRouter();
  const onBack = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!canGoBack || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) {
      return;
    }
    event.preventDefault();
    router.history.back();
  };
  return (
    <nav className="hp-bar" aria-label="Habit">
      <Link to="/" className="hp-bar-back" aria-label="Back to habits" onClick={onBack}>
        <CaretLeftIcon weight="bold" />
      </Link>
      {children}
    </nav>
  );
}

/** A deleted habit, or a link to one that never existed: a calm way back. */
function MissingHabit() {
  return (
    <main className="habit-page">
      <PageBar />
      <div className="hp-missing">
        <DaySquare color="stone" intensity={0} variant="ghost" size="2.5rem" animated={false} />
        <h1 className="hp-missing-title">This habit is not here</h1>
        <p className="hp-missing-text">It was deleted, or the link is wrong.</p>
        <Link to="/" className="hp-missing-link">
          Back to habits
        </Link>
      </div>
    </main>
  );
}

/** Until the first data comes (no snapshot yet): the shape of the page, without data. */
function PageSkeleton() {
  return (
    <main className="habit-page hp-skeleton" aria-busy aria-label="Loading the habit">
      <PageBar />
      <div className="hp-identity">
        <span className="hp-skeleton-icon" />
        <span className="hp-skeleton-name" />
      </div>
    </main>
  );
}
