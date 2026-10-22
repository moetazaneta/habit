import type { HabitColor } from "@habit/core";
import { useEffect, useState } from "react";

import { DaySquare } from "@/components/day-square";

/** Five Days of five habits: a glimpse of the list, in the palette of the app. */
const DAYS: ReadonlyArray<{ color: HabitColor; intensity: number }> = [
  { color: "sky", intensity: 1 },
  { color: "green", intensity: 0.5 },
  { color: "ochre", intensity: 1 },
  { color: "violet", intensity: 0.25 },
  { color: "rose", intensity: 0.75 },
];

/** The time between the fills of two neighbour squares. */
const STAGGER_MS = 70;

/**
 * The mark of the screens before the list: five Day gauges in a row. Empty, they hold the place
 * while the sign-in state loads; `filled`, they fill one after the other with the gauge's own
 * spring, so the sign-in screen opens with the signature move of the app.
 */
export function AuthMark({ filled }: { filled: boolean }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!filled) return;
    const timers = DAYS.map((_, index) =>
      setTimeout(() => setCount(index + 1), 120 + index * STAGGER_MS),
    );
    return () => timers.forEach(clearTimeout);
  }, [filled]);

  return (
    <div className="flex gap-(--square-gap)" aria-hidden>
      {DAYS.map((day, index) => (
        <DaySquare
          key={day.color}
          color={day.color}
          intensity={index < count ? day.intensity : 0}
          size="var(--auth-square)"
        />
      ))}
    </div>
  );
}
