import type { Day, Habit } from "@habit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Link } from "@tanstack/react-router";
import { useReducedMotion } from "motion/react";
import { memo, type CSSProperties, type MouseEvent } from "react";

import { HabitIcon } from "@/components/habit-icon";
import { habitColorStyle } from "@/components/palette";
import { markPlate } from "@/features/habit-page/plate-transition";
import { DayCells, type DayCellsProps } from "@/features/list/day-cells";

export interface HabitRowProps extends Pick<DayCellsProps, "days" | "today" | "entries"> {
  habit: Habit;
  onTap: (habit: Habit, day: Day) => void;
  onOpenInput: (habit: Habit, day: Day) => void;
  onPaint: (habit: Habit, days: Day[], mode: "set" | "clear") => void;
}

/**
 * One habit in the list: the icon and the name at the left (a tap opens the habit page, a long
 * press lifts the row for a reorder), and the last Days at the right.
 */
export const HabitRow = memo(function HabitRow({
  habit,
  days,
  today,
  entries,
  onTap,
  onOpenInput,
  onPaint,
}: HabitRowProps) {
  const reduceMotion = useReducedMotion() === true;
  const {
    setNodeRef,
    setActivatorNodeRef,
    listeners,
    attributes,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: habit.id,
    // The rows that make room, and the drop, move with the app's ease-out; under reduced motion
    // they move at once (the lifted row still follows the finger).
    transition: reduceMotion ? null : { duration: 200, easing: "cubic-bezier(0.23, 1, 0.32, 1)" },
  });
  // The name stays a link: dnd kit's `role="button"` would hide that from screen readers.
  const { role: _role, ...sortableAttributes } = attributes;

  return (
    <div
      ref={setNodeRef}
      className="habit-row"
      data-dragging={isDragging ? "" : undefined}
      style={
        {
          ...habitColorStyle(habit.color),
          transform: CSS.Translate.toString(transform),
          transition,
        } as CSSProperties
      }
    >
      <div className="habit-row-inner">
        <Link
          ref={setActivatorNodeRef}
          to="/habits/$habitId"
          params={{ habitId: habit.id }}
          className="habit-row-head"
          draggable={false}
          {...sortableAttributes}
          {...listeners}
          aria-roledescription="habit, long press to reorder"
          // The icon and the name grow into the title of the habit page; under reduced motion the
          // screens only crossfade.
          viewTransition
          onClick={(event: MouseEvent<HTMLAnchorElement>) => {
            if (!reduceMotion && isPlainClick(event)) markPlate(event.currentTarget);
          }}
        >
          <HabitIcon icon={habit.icon} color={habit.color} />
          <span className="habit-row-name" dir="auto">
            {habit.name}
          </span>
        </Link>
        <DayCells
          habit={habit}
          days={days}
          today={today}
          entries={entries}
          onTap={(day) => onTap(habit, day)}
          onOpenInput={(day) => onOpenInput(habit, day)}
          onPaint={(painted, mode) => onPaint(habit, painted, mode)}
        />
      </div>
    </div>
  );
});

/**
 * A click of a pointer that navigates in this tab: no modifier key, the main button. Enter on the
 * link (`detail` 0) is the keyboard, which does not animate.
 */
function isPlainClick(event: MouseEvent): boolean {
  return (
    event.detail !== 0 &&
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}
