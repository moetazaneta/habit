import { animate, useMotionValue, type MotionValue } from "motion/react";
import { useCallback, useEffect, useRef, useState, type PointerEvent, type RefObject } from "react";

import { haptic } from "@/components/haptics";
import { springs } from "@/components/motion";

/** The width of the Remove action that a short swipe uncovers, in px. */
export const REMOVE_WIDTH = 76;
/** A move this long, in px, decides the axis: across is a swipe, along is the browser's scroll. */
const SLOP = 8;
/** Let go past this share of the row's width, a swipe removes at once. */
const FULL_SWIPE = 0.55;
/** A flick faster than this, in px per ms, opens or closes the row whatever its distance. */
const FLICK = 0.4;
/** The last move older than this, in ms, when the finger lifts: it had stopped, no flick. */
const STALE_MS = 80;

interface Gesture {
  pointerId: number;
  startX: number;
  startY: number;
  /** Where the row was when the finger came down: closed, open, or on its way. */
  from: number;
  across: boolean;
  lastX: number;
  lastT: number;
  velocity: number;
}

export interface SwipeToRemove {
  /** The row's offset: 0 closed, `-REMOVE_WIDTH` open, down to minus its width on a full swipe. */
  x: MotionValue<number>;
  open: boolean;
  close: () => void;
  /** The element around the row and its action: a touch outside it closes the row. */
  container: RefObject<HTMLDivElement | null>;
  handlers: {
    onPointerDown: (event: PointerEvent<HTMLElement>) => void;
    onPointerMove: (event: PointerEvent<HTMLElement>) => void;
    onPointerUp: (event: PointerEvent<HTMLElement>) => void;
    onPointerCancel: (event: PointerEvent<HTMLElement>) => void;
  };
}

/**
 * A touch swipe to the left over a row, as in iOS: a short one uncovers the row's Remove action, a
 * long or fast one removes the row at once. A tap anywhere closes an open row. The browser keeps
 * the vertical scroll, so the row needs `touch-action: pan-y`. A mouse does not swipe: on a
 * desktop the row has its buttons.
 */
export function useSwipeToRemove({
  enabled,
  blocked,
  onRemove,
  reduceMotion,
}: {
  enabled: boolean;
  /** True while something else owns the touch, such as a row lifted for a reorder. */
  blocked: () => boolean;
  onRemove: () => void;
  reduceMotion: boolean;
}): SwipeToRemove {
  const x = useMotionValue(0);
  const [open, setOpen] = useState(false);
  const gesture = useRef<Gesture | null>(null);
  const container = useRef<HTMLDivElement>(null);

  const settle = useCallback(
    (to: number, velocity = 0) => {
      void animate(x, to, reduceMotion ? { duration: 0 } : { ...springs.lift, velocity });
    },
    [x, reduceMotion],
  );

  const close = useCallback(() => {
    setOpen(false);
    settle(0);
  }, [settle]);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: globalThis.PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) close();
    };
    document.addEventListener("pointerdown", onDown, { capture: true });
    return () => document.removeEventListener("pointerdown", onDown, { capture: true });
  }, [open, close]);

  useEffect(() => {
    if (!enabled) close();
  }, [enabled, close]);

  const release = (event: PointerEvent<HTMLElement>, lifted: boolean) => {
    const current = gesture.current;
    if (current === null || current.pointerId !== event.pointerId) return;
    gesture.current = null;
    if (!current.across) {
      if (open) close();
      return;
    }
    const width = event.currentTarget.offsetWidth;
    const value = x.get();
    const velocity = lifted && event.timeStamp - current.lastT < STALE_MS ? current.velocity : 0;
    if (lifted && (value < -width * FULL_SWIPE || (velocity < -FLICK && value < -REMOVE_WIDTH))) {
      settle(-width, velocity * 1000);
      haptic();
      onRemove();
    } else if (velocity < -FLICK || (velocity <= FLICK && value < -REMOVE_WIDTH / 2)) {
      setOpen(true);
      settle(-REMOVE_WIDTH, velocity * 1000);
    } else {
      setOpen(false);
      settle(0, velocity * 1000);
    }
  };

  return {
    x,
    open,
    close,
    container,
    handlers: {
      onPointerDown: (event) => {
        if (!enabled || event.pointerType !== "touch" || !event.isPrimary) return;
        x.stop();
        gesture.current = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          from: x.get(),
          across: false,
          lastX: event.clientX,
          lastT: event.timeStamp,
          velocity: 0,
        };
      },
      onPointerMove: (event) => {
        const current = gesture.current;
        if (current === null || current.pointerId !== event.pointerId) return;
        if (!current.across) {
          const dx = event.clientX - current.startX;
          const dy = event.clientY - current.startY;
          if (Math.abs(dx) < SLOP && Math.abs(dy) < SLOP) return;
          if (blocked() || Math.abs(dy) >= Math.abs(dx)) {
            gesture.current = null;
            if (open) close();
            return;
          }
          current.across = true;
          // From here the row follows the finger, without the jump of the slop.
          current.startX = event.clientX;
          event.currentTarget.setPointerCapture(event.pointerId);
        }
        const width = event.currentTarget.offsetWidth;
        const next = current.from + event.clientX - current.startX;
        // To the right of closed, the row only stretches a little.
        x.set(next > 0 ? next * 0.2 : Math.max(next, -width));
        const elapsed = event.timeStamp - current.lastT;
        if (elapsed > 0) current.velocity = (event.clientX - current.lastX) / elapsed;
        current.lastX = event.clientX;
        current.lastT = event.timeStamp;
      },
      onPointerUp: (event) => release(event, true),
      onPointerCancel: (event) => release(event, false),
    },
  };
}
