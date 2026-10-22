import { addMonths, type Month } from "@habit/core";
import { animate, type AnimationPlaybackControls } from "motion";
import { useMotionValue } from "motion/react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { durations, springs } from "@/components/motion";

/** A page of the pager: a Month at a slot (-1 left, 0 shown, 1 right). */
export interface PagerSlot {
  month: Month;
  slot: -1 | 0 | 1;
}

const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";

/** How far a release projects the finger's speed, in seconds: a flick goes to the next page. */
const PROJECTION_S = 0.2;

export interface MonthPager {
  /** The pages to render, each at `translateX(slot * 100%)` inside the track. */
  slots: PagerSlot[];
  /** The Month at slot 0. */
  shown: Month;
  viewportRef: React.RefObject<HTMLDivElement | null>;
  trackRef: React.RefObject<HTMLDivElement | null>;
  /** Slides to a Month (a neighbour or any older Month). */
  goTo: (month: Month) => void;
  /** A finger lands: stops a slide. True when the pages were moving. */
  grab: () => boolean;
  /** The finger moved `dx` pixels since it started to swipe. */
  drag: (dx: number) => void;
  /** The finger left with a speed in pixels per second: settle on the nearest page. */
  release: (velocity: number) => void;
}

/**
 * The paging of the calendar: one Month per page, the newest Month at the right end, older Months
 * to the left without end. The track follows the finger 1:1, has a rubber band where no page is,
 * and settles with the sheet spring, which carries the finger's speed. Under reduced motion a page
 * fades in instead of sliding. A change from the keyboard (the arrows, Page Up / Page Down, Enter
 * on a button) is instant: keyboard navigation does not animate, and the focus can follow at once.
 *
 * The parent owns the Month (`month`, `onMonthChange`): the pager reports a new Month when it
 * starts to settle on it, and slides when `month` changes from outside.
 */
export function useMonthPager({
  month,
  newest,
  onMonthChange,
  reduceMotion,
}: {
  month: Month;
  newest: Month;
  onMonthChange: (month: Month) => void;
  reduceMotion: boolean;
}): MonthPager {
  const [shown, setShown] = useState(month);
  const [incoming, setIncoming] = useState<Month | null>(null);
  const x = useMotionValue(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const animation = useRef<AnimationPlaybackControls | null>(null);
  /** The Month that the pager shows or slides to. */
  const target = useRef(month);
  const grabbedAt = useRef(0);
  const fadeIn = useRef(false);
  /** The last input was a key, not a pointer. */
  const keyboard = useRef(false);

  const slots = slotsOf(shown, incoming, newest);
  const latest = useRef({ slots, shown, onMonthChange, reduceMotion });
  latest.current = { slots, shown, onMonthChange, reduceMotion };

  // The track follows x at once, not on the next frame, so a swap of the pages and the jump of x
  // back to 0 land in the same paint.
  useLayoutEffect(() => {
    const write = (value: number) => {
      const track = trackRef.current;
      if (track !== null) track.style.transform = value === 0 ? "" : `translate3d(${value}px,0,0)`;
    };
    write(x.get());
    return x.on("change", write);
  }, [x]);

  // After a page became the shown one, the track is back at 0.
  useLayoutEffect(() => {
    x.jump(0);
    if (!fadeIn.current) return;
    fadeIn.current = false;
    trackRef.current
      ?.querySelector('[data-slot="0"]')
      ?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: durations.fade, easing: EASE_OUT });
  }, [shown, x]);

  useEffect(() => {
    const onKey = () => (keyboard.current = true);
    const onPointer = () => (keyboard.current = false);
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("pointerdown", onPointer, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("pointerdown", onPointer, true);
    };
  }, []);

  const width = useCallback(() => viewportRef.current?.clientWidth || 1, []);

  const settle = useCallback(
    (slot: -1 | 0 | 1, velocity: number) => {
      const { slots, shown, onMonthChange, reduceMotion } = latest.current;
      const destination = slots.find((page) => page.slot === slot)?.month ?? shown;
      if (destination !== target.current) {
        target.current = destination;
        onMonthChange(destination);
      }
      const finish = () => {
        animation.current = null;
        setIncoming(null);
        setShown(destination);
      };
      animation.current?.stop();
      if (reduceMotion || keyboard.current) {
        fadeIn.current = reduceMotion && destination !== shown;
        finish();
        if (destination === shown) x.jump(0);
        return;
      }
      if (x.get() === -slot * width()) {
        finish();
        return;
      }
      animation.current = animate(x, -slot * width(), {
        ...springs.sheet,
        velocity,
        // Done within a pixel: the tail of the spring must not hold back a tap on the new page.
        restDelta: 1,
        restSpeed: 30,
        onComplete: finish,
      });
    },
    [width, x],
  );

  const goTo = useCallback(
    (destination: Month) => {
      const { shown } = latest.current;
      if (destination > newest || destination === target.current) return;
      if (destination === shown) {
        settle(0, 0);
        return;
      }
      const slot = destination < shown ? -1 : 1;
      target.current = destination;
      latest.current.onMonthChange(destination);
      setIncoming(destination);
      // The incoming page renders with this state; the slide starts from where the track is.
      latest.current.slots = slotsOf(shown, destination, newest);
      settle(slot, 0);
    },
    [newest, settle],
  );

  // A Month from outside (the grid, the Today button of the parent): slide to it.
  useEffect(() => {
    if (month !== target.current) goTo(month);
  }, [month, goTo]);

  const grab = useCallback(() => {
    const moving = animation.current !== null || x.get() !== 0;
    animation.current?.stop();
    animation.current = null;
    grabbedAt.current = x.get();
    return moving;
  }, [x]);

  const drag = useCallback(
    (dx: number) => {
      const size = width();
      const indexes = latest.current.slots.map((page) => page.slot);
      // A page at slot s rests at x = -s * width.
      const min = -Math.max(...indexes) * size;
      const max = -Math.min(...indexes) * size;
      x.set(rubberBand(grabbedAt.current + dx, min, max, size));
    },
    [width, x],
  );

  const release = useCallback(
    (velocity: number) => {
      const size = width();
      const indexes = latest.current.slots.map((page) => page.slot);
      const projected = x.get() + velocity * PROJECTION_S;
      // Never more than one page from the shown one.
      const nearest = Math.round(-projected / size);
      const slot = Math.min(Math.max(nearest, Math.min(...indexes), -1), Math.max(...indexes), 1);
      settle(slot as -1 | 0 | 1, velocity);
    },
    [settle, width, x],
  );

  useEffect(() => () => animation.current?.stop(), []);

  return { slots, shown, viewportRef, trackRef, goTo, grab, drag, release };
}

/** The pages around the shown Month: its neighbours, or the Month it slides to. */
function slotsOf(shown: Month, incoming: Month | null, newest: Month): PagerSlot[] {
  if (incoming !== null) {
    return [
      { month: shown, slot: 0 },
      { month: incoming, slot: incoming < shown ? -1 : 1 },
    ];
  }
  const slots: PagerSlot[] = [
    { month: addMonths(shown, -1), slot: -1 },
    { month: shown, slot: 0 },
  ];
  if (shown < newest) slots.push({ month: addMonths(shown, 1), slot: 1 });
  return slots;
}

/** Past the ends, the track moves less and less, as a scroll view on iOS does. */
function rubberBand(value: number, min: number, max: number, size: number): number {
  const band = (distance: number) => (1 - 1 / ((distance * 0.55) / size + 1)) * size;
  if (value > max) return max + band(value - max);
  if (value < min) return min - band(min - value);
  return value;
}
