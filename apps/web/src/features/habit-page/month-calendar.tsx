import {
  addDays,
  addMonths,
  intensity,
  isFuture,
  monthOf,
  paintAction,
  tapResult,
  type Day,
  type EntryValue,
  type Habit,
  type HabitId,
  type Month,
} from "@habit/core";
import { useEntries, useMonth } from "@habit/data";
import { CaretLeftIcon } from "@phosphor-icons/react/dist/csr/CaretLeft";
import { CaretRightIcon } from "@phosphor-icons/react/dist/csr/CaretRight";
import { useReducedMotion } from "motion/react";
import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { useAct } from "@/components/act";
import { DaySquare } from "@/components/day-square";
import { haptic } from "@/components/haptics";
import { entryRef, useOpenSheet } from "@/components/sheet-search";
import { dayOfMonth, describeEntry, formatDayLong } from "@/features/habit-page/format";
import { CALENDAR_ROWS, formatMonth, monthWeeks } from "@/features/habit-page/months";
import { useMonthPager } from "@/features/habit-page/use-month-pager";

/** A check Day held this long starts a paint; a faster move is a swipe between Months. */
export const PAINT_HOLD_MS = 200;
/** A number Day held this long opens the input of the exact value. */
export const LONG_PRESS_MS = 450;
/** A press that moves farther than this is not a tap. */
const SLOP_PX = 8;
/** A horizontal wheel (a trackpad swipe) of this many pixels turns one page. */
const WHEEL_PAGE_PX = 60;
/** Wheel events closer than this belong to one trackpad swipe (with its momentum). */
const WHEEL_QUIET_MS = 250;

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"] as const;

type Gesture =
  | { type: "idle" }
  | {
      type: "press";
      pointerId: number;
      pointerType: string;
      /** The Day under the finger, or null (a blank cell, or the pages were moving). */
      day: Day | null;
      x: number;
      y: number;
      timer: number | undefined;
    }
  | { type: "swipe"; pointerId: number; x: number; samples: { t: number; x: number }[] }
  | { type: "paint"; pointerId: number; mode: "set" | "clear"; days: Day[] }
  /** The long press opened the input: the rest of this press does nothing. */
  | { type: "held"; pointerId: number };

interface Paint {
  mode: "set" | "clear";
  days: Day[];
}

export interface MonthCalendarProps {
  habit: Habit;
  today: Day;
  /** The Month on screen. The parent owns it, so the grid can move it too. */
  month: Month;
  onMonthChange: (month: Month) => void;
}

/**
 * The calendar of a habit: one Month per page. A swipe moves between Months (the current Month
 * first, older Months with a swipe to the right, no future Months); the arrows, a trackpad swipe
 * and Page Up / Page Down do the same.
 *
 * Input, as in the list (docs/v1.md, "Input"):
 * - check: a tap toggles the Day; a hold of PAINT_HOLD_MS, then a drag, paints the Days (the first
 *   Day sets the state, every Day under the finger gets it) and shows one Undo toast. With a
 *   mouse, a drag paints at once: a mouse does not swipe.
 * - number: a tap adds the Step; a long press (or a right click) opens the input.
 * - choice, scale, text: a tap opens the input.
 * - future Days are locked.
 */
export function MonthCalendar({ habit, today, month, onMonthChange }: MonthCalendarProps) {
  const newest = monthOf(today);
  const entries = useEntries();
  const act = useAct();
  const openSheet = useOpenSheet();
  const reduceMotion = useReducedMotion() === true;
  const pager = useMonthPager({ month, newest, onMonthChange, reduceMotion });
  const gesture = useRef<Gesture>({ type: "idle" });
  const [pressed, setPressed] = useState<Day | null>(null);
  const [paint, setPaint] = useState<Paint | null>(null);
  const [focusDay, setFocusDay] = useState<Day | null>(null);
  const pendingFocus = useRef<Day | null>(null);

  const latest = useRef({ entries, habit, today });
  latest.current = { entries, habit, today };

  const tap = useCallback(
    (day: Day) => {
      const { entries, habit, today } = latest.current;
      const result = tapResult(habit, day, entries(habit.id, day), today);
      if (result.type === "action") act(result.action);
      else if (result.type === "openInput") openSheet({ entry: entryRef(habit.id, day) });
    },
    [act, openSheet],
  );

  const openInput = useCallback(
    (day: Day) => openSheet({ entry: entryRef(latest.current.habit.id, day) }),
    [openSheet],
  );

  const commitPaint = useCallback(
    (days: Day[], mode: "set" | "clear") => {
      if (days.length === 1) {
        // A hold without a drag: the same as a tap, without a toast.
        tap(days[0]!);
        return;
      }
      const { entries, habit, today } = latest.current;
      const action = paintAction(habit, days, mode, today, entries);
      const count = action.type === "batch" ? action.actions.length : 1;
      if (count === 0) return;
      const noun = count === 1 ? "day" : "days";
      act(action, {
        undo: mode === "set" ? `Painted ${count} ${noun}` : `Cleared ${count} ${noun}`,
      });
    },
    [act, tap],
  );

  const page = useCallback(
    (direction: -1 | 1) => {
      const destination = addMonths(month, direction);
      if (destination <= newest) pager.goTo(destination);
    },
    [month, newest, pager],
  );

  // ── Pointer gestures ──────────────────────────────────────────────────────────────────────────

  const startPaint = (pointerId: number, days: Day[]) => {
    const current = gesture.current;
    if (current.type === "press") window.clearTimeout(current.timer);
    const { entries, habit } = latest.current;
    const mode = entries(habit.id, days[0]!) === undefined ? "set" : "clear";
    gesture.current = { type: "paint", pointerId, mode, days };
    setPressed(null);
    setPaint({ mode, days });
    haptic("lift");
  };

  const endPress = () => {
    const current = gesture.current;
    if (current.type === "press") window.clearTimeout(current.timer);
    gesture.current = { type: "idle" };
    setPressed(null);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (gesture.current.type !== "idle") return;
    const moving = pager.grab();
    const day = moving ? null : enabledDayAt(event.target);
    const { pointerId, pointerType } = event;
    let timer: number | undefined;
    if (day !== null && habit.kind === "check" && pointerType !== "mouse") {
      timer = window.setTimeout(() => startPaint(pointerId, [day]), PAINT_HOLD_MS);
    } else if (day !== null && habit.kind === "number") {
      timer = window.setTimeout(() => {
        gesture.current = { type: "held", pointerId };
        setPressed(null);
        haptic("lift");
        openInput(day);
      }, LONG_PRESS_MS);
    }
    event.currentTarget.setPointerCapture?.(pointerId);
    gesture.current = {
      type: "press",
      pointerId,
      pointerType,
      day,
      x: event.clientX,
      y: event.clientY,
      timer,
    };
    setPressed(day);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const current = gesture.current;
    if (current.type === "idle" || current.pointerId !== event.pointerId) return;

    if (current.type === "press") {
      const dx = event.clientX - current.x;
      const dy = event.clientY - current.y;
      if (current.pointerType === "mouse") {
        const over = enabledDayAtPoint(event.clientX, event.clientY);
        if (over === current.day) return;
        if (habit.kind === "check" && current.day !== null && over !== null) {
          startPaint(event.pointerId, [current.day, over]);
        } else if (Math.hypot(dx, dy) > SLOP_PX) {
          endPress();
          pager.release(0);
        }
        return;
      }
      if (Math.abs(dx) > SLOP_PX && Math.abs(dx) > Math.abs(dy)) {
        window.clearTimeout(current.timer);
        gesture.current = {
          type: "swipe",
          pointerId: event.pointerId,
          x: event.clientX,
          samples: [{ t: event.timeStamp, x: event.clientX }],
        };
        setPressed(null);
        return;
      }
      // A vertical move is the browser's scroll: it cancels the pointer.
      if (Math.hypot(dx, dy) > SLOP_PX) endPress();
      return;
    }

    if (current.type === "swipe") {
      pager.drag(event.clientX - current.x);
      current.samples.push({ t: event.timeStamp, x: event.clientX });
      if (current.samples.length > 8) current.samples.shift();
      return;
    }

    if (current.type === "paint") {
      const over = enabledDayAtPoint(event.clientX, event.clientY);
      if (over === null || current.days.includes(over)) return;
      const days = [...current.days, over];
      gesture.current = { ...current, days };
      setPaint({ mode: current.mode, days });
      haptic();
    }
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const current = gesture.current;
    if (current.type === "idle" || current.pointerId !== event.pointerId) return;
    endPress();
    switch (current.type) {
      case "press":
        if (current.day === null) {
          pager.release(0);
        } else {
          haptic();
          tap(current.day);
        }
        return;
      case "swipe":
        pager.release(velocityOf(current.samples));
        return;
      case "paint":
        setPaint(null);
        commitPaint(current.days, current.mode);
        return;
      case "held":
        return;
    }
  };

  const onPointerCancel = (event: ReactPointerEvent<HTMLDivElement>) => {
    const current = gesture.current;
    if (current.type === "idle" || current.pointerId !== event.pointerId) return;
    endPress();
    setPaint(null);
    if (current.type === "press" || current.type === "swipe") pager.release(0);
  };

  // While a paint or a swipe runs, the page must not scroll: `touch-action` is fixed when the
  // finger lands, so a paint that starts after the hold stops the scroll here. React's touch
  // listeners are passive, so this one is native.
  useEffect(() => {
    const viewport = pager.viewportRef.current;
    if (viewport === null) return;
    const onTouchMove = (event: TouchEvent) => {
      const type = gesture.current.type;
      if ((type === "paint" || type === "swipe") && event.cancelable) event.preventDefault();
    };
    viewport.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => viewport.removeEventListener("touchmove", onTouchMove);
  }, [pager.viewportRef]);

  // A horizontal trackpad swipe turns one page, also with its momentum. It must not reach the
  // browser, which would go back in the history.
  const pageRef = useRef(page);
  pageRef.current = page;
  useEffect(() => {
    const viewport = pager.viewportRef.current;
    if (viewport === null) return;
    let distance = 0;
    let quietUntil = 0;
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      event.preventDefault();
      const now = event.timeStamp;
      if (now < quietUntil) {
        quietUntil = now + WHEEL_QUIET_MS;
        return;
      }
      distance += event.deltaX;
      if (Math.abs(distance) < WHEEL_PAGE_PX) return;
      pageRef.current(distance > 0 ? 1 : -1);
      distance = 0;
      quietUntil = now + WHEEL_QUIET_MS;
    };
    viewport.addEventListener("wheel", onWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", onWheel);
  }, [pager.viewportRef]);

  // ── Keyboard ──────────────────────────────────────────────────────────────────────────────────

  // One Day of the shown Month takes the Tab stop; the arrows move it (a roving tab index).
  const shownMonth = pager.shown;
  const tabDay = useMemo(() => {
    if (focusDay !== null && monthOf(focusDay) === shownMonth) return focusDay;
    if (monthOf(today) === shownMonth) return today;
    return `${shownMonth}-01` as Day;
  }, [focusDay, shownMonth, today]);

  useLayoutEffect(() => {
    const day = pendingFocus.current;
    if (day === null || monthOf(day) !== shownMonth) return;
    pendingFocus.current = null;
    pager.trackRef.current
      ?.querySelector<HTMLElement>(`[data-slot="0"] [data-day="${day}"]`)
      ?.focus({ preventScroll: true });
  }, [shownMonth, pager.trackRef]);

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "PageUp" || event.key === "PageDown") {
      event.preventDefault();
      page(event.key === "PageUp" ? -1 : 1);
      return;
    }
    const step = ARROW_STEPS[event.key];
    const day = dayOfElement(event.target);
    if (step === undefined || day === null) return;
    event.preventDefault();
    const next = addDays(day, step);
    if (isFuture(next, today)) return;
    setFocusDay(next);
    if (monthOf(next) === shownMonth) {
      pager.trackRef.current
        ?.querySelector<HTMLElement>(`[data-slot="0"] [data-day="${next}"]`)
        ?.focus({ preventScroll: true });
    } else {
      pendingFocus.current = next;
      pager.goTo(monthOf(next));
    }
  };

  return (
    <section className="hp-cal" aria-labelledby="hp-cal-title">
      <div className="hp-cal-head">
        <h2 id="hp-cal-title" className="hp-cal-title" aria-live="polite">
          {formatMonth(month)}
        </h2>
        {month === newest ? null : (
          <button type="button" className="hp-cal-today" onClick={() => pager.goTo(newest)}>
            Today
          </button>
        )}
        <button
          type="button"
          className="hp-cal-arrow"
          aria-label="Previous month"
          onClick={() => page(-1)}
        >
          <CaretLeftIcon weight="bold" />
        </button>
        <button
          type="button"
          className="hp-cal-arrow"
          aria-label="Next month"
          disabled={month >= newest}
          onClick={() => page(1)}
        >
          <CaretRightIcon weight="bold" />
        </button>
      </div>
      <div className="hp-cal-weekdays" aria-hidden>
        {WEEKDAYS.map((letter, index) => (
          <span key={index}>{letter}</span>
        ))}
      </div>
      <div
        ref={pager.viewportRef}
        className="hp-cal-viewport"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onKeyDown={onKeyDown}
        onClick={(event) => {
          // Pointer taps are handled on pointerup; a click with no pointer (`detail` 0) is Enter or
          // Space on the focused Day.
          if (event.detail !== 0) return;
          const day = enabledDayAt(event.target);
          if (day !== null) tap(day);
        }}
        onContextMenu={(event) => {
          const day = dayOfElement(event.target);
          if (day === null) return;
          event.preventDefault();
          if (gesture.current.type === "held" || habit.kind !== "number") return;
          if (enabledDayAt(event.target) === null) return;
          endPress();
          openInput(day);
        }}
      >
        <div ref={pager.trackRef} className="hp-cal-track">
          {pager.slots.map(({ month: pageMonth, slot }) => (
            <MonthPage
              key={pageMonth}
              habit={habit}
              month={pageMonth}
              slot={slot}
              today={today}
              entries={entries}
              pressed={slot === 0 ? pressed : null}
              paint={slot === 0 ? paint : null}
              tabDay={slot === 0 ? tabDay : null}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

const ARROW_STEPS: Record<string, number> = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -7,
  ArrowDown: 7,
};

interface MonthPageProps {
  habit: Habit;
  month: Month;
  slot: -1 | 0 | 1;
  today: Day;
  entries: (habitId: HabitId, day: Day) => EntryValue | undefined;
  pressed: Day | null;
  paint: Paint | null;
  tabDay: Day | null;
}

/**
 * One Month: weeks are rows, Monday first, always 6 rows high so the page does not jump. A Month
 * older than the live window loads while its page exists; until then its Days take no input.
 */
const MonthPage = memo(function MonthPage({
  habit,
  month,
  slot,
  today,
  entries,
  pressed,
  paint,
  tabDay,
}: MonthPageProps) {
  const loading = useMonth(month) === "loading";
  const weeks = useMemo(() => monthWeeks(month), [month]);
  const offscreen = slot !== 0;
  return (
    <div
      className="hp-month"
      data-slot={slot}
      data-loading={loading ? "" : undefined}
      role="group"
      aria-label={formatMonth(month)}
      aria-busy={loading || undefined}
      aria-hidden={offscreen || undefined}
      inert={offscreen}
      style={offscreen ? { transform: `translateX(${slot * 100}%)` } : undefined}
    >
      {weeks
        .flat()
        .map((day, index) =>
          day === null ? (
            <span key={`blank-${index}`} className="hp-day-blank" />
          ) : (
            <CalendarDay
              key={day}
              habit={habit}
              day={day}
              today={today}
              value={entries(habit.id, day)}
              loading={loading}
              pressed={pressed === day}
              painted={paint !== null && paint.days.includes(day) ? paint.mode : null}
              tabbable={tabDay === day}
            />
          ),
        )}
      {Array.from({ length: (CALENDAR_ROWS - weeks.length) * 7 }, (_, index) => (
        <span key={`fill-${index}`} className="hp-day-blank" />
      ))}
    </div>
  );
});

function CalendarDay({
  habit,
  day,
  today,
  value,
  loading,
  pressed,
  painted,
  tabbable,
}: {
  habit: Habit;
  day: Day;
  today: Day;
  value: EntryValue | undefined;
  loading: boolean;
  pressed: boolean;
  painted: "set" | "clear" | null;
  tabbable: boolean;
}) {
  const future = isFuture(day, today);
  const level = painted === null ? intensity(habit, value) : painted === "set" ? 1 : 0;
  return (
    <button
      type="button"
      className="hp-day"
      data-day={day}
      data-today={day === today ? "" : undefined}
      data-pressed={pressed ? "" : undefined}
      tabIndex={tabbable ? 0 : -1}
      aria-label={`${formatDayLong(day)}: ${loading ? "loading" : describeEntry(habit, value)}`}
      aria-current={day === today ? "date" : undefined}
      aria-pressed={habit.kind === "check" && !loading ? value !== undefined : undefined}
      aria-haspopup={
        habit.kind === "choice" || habit.kind === "scale" || habit.kind === "text"
          ? "dialog"
          : undefined
      }
      disabled={future || loading}
    >
      <span className="hp-day-number" aria-hidden>
        {dayOfMonth(day)}
      </span>
      <span className="hp-day-press">
        <DaySquare
          color={habit.color}
          intensity={loading ? 0 : level}
          size="var(--cal-square)"
          variant={future ? "future" : "day"}
          label={painted === null ? optionMark(habit, value) : undefined}
          data-entry={entryRef(habit.id, day)}
        />
      </span>
    </button>
  );
}

/** The emoji (or the first letter) of a choice, shown in its square. */
function optionMark(habit: Habit, value: EntryValue | undefined): string | undefined {
  if (habit.kind !== "choice" || value?.kind !== "choice") return undefined;
  const option = habit.options.find((candidate) => candidate.id === value.optionId);
  if (option === undefined) return undefined;
  return option.emoji ?? Array.from(option.label.trim())[0]?.toUpperCase();
}

function dayOfElement(target: EventTarget | null): Day | null {
  if (!(target instanceof Element)) return null;
  const cell = target.closest<HTMLElement>("[data-day]");
  return (cell?.dataset.day as Day | undefined) ?? null;
}

/** The Day of a button on the shown page that takes input, or null. */
function enabledDayAt(target: EventTarget | null): Day | null {
  if (!(target instanceof Element)) return null;
  const cell = target.closest<HTMLButtonElement>("button[data-day]");
  if (cell === null || cell.disabled) return null;
  if (cell.closest("[data-slot]")?.getAttribute("data-slot") !== "0") return null;
  return cell.dataset.day as Day;
}

function enabledDayAtPoint(x: number, y: number): Day | null {
  return enabledDayAt(document.elementFromPoint?.(x, y) ?? null);
}

/** The finger's speed over the last 100 ms, in pixels per second. */
function velocityOf(samples: { t: number; x: number }[]): number {
  const last = samples[samples.length - 1];
  if (last === undefined) return 0;
  const first = samples.find((sample) => last.t - sample.t <= 100) ?? last;
  const elapsed = last.t - first.t;
  return elapsed > 0 ? ((last.x - first.x) / elapsed) * 1000 : 0;
}
