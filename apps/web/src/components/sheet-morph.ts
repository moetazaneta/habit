import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useLayoutEffect, useRef, type RefObject } from "react";

import { sheetTiming } from "@/components/motion";

const SOURCE_ATTRIBUTE = "data-morph-source";

/** The props of a control that a sheet grows out of: `<button {...morphSource("new-habit")}>`. */
export function morphSource(id: string): { [SOURCE_ATTRIBUTE]: string } {
  return { [SOURCE_ATTRIBUTE]: id };
}

const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";
/** The control's label fades out under the growing shape, and back in when the shape lands. */
const HANDOFF_MS = 120;
/** The sheet's content comes in once the shape has grown most of the way. */
const CONTENT_DELAY_MS = 150;
const CONTENT_FADE_MS = 240;
/** The sheet's shadow, which the clip cuts while the shape moves, fades in after it. */
const SHADOW_FADE_MS = 200;
const RESTORE_MS = 200;

interface Session {
  source: HTMLElement;
  /** The viewport the sheet grew in. */
  viewport: HTMLElement;
  /** Holds the source at opacity 0 while the sheet is open. */
  hidden: Animation;
  /** The growth, until it ends. */
  running: Animation[];
}

/**
 * The sheet grows out of the control that opened it and shrinks back into it, after Family. The
 * viewport of the sheet (fixed, over the whole window) is the moving shape: its clip goes from the
 * control's box to the sheet's with the sheet spring, filled with the control's color turning into
 * the sheet's. The sheet sits in place inside that clip and fades in; the control hides while the
 * sheet is open. `data-morph` on the viewport turns off the usual slide and scale (styles.css).
 *
 * A swipe down, and a back that the browser animates itself (the back swipe on iOS), close the
 * sheet the usual way. So does a control that is no longer on screen, and reduced motion skips the
 * morph altogether.
 */
export function useSheetMorph(
  sourceId: string | undefined,
  open: boolean,
): {
  viewportRef: (element: HTMLElement | null) => void;
  popupRef: RefObject<HTMLDivElement | null>;
  /** Before a swipe closes the sheet: it slides away instead. */
  release: () => void;
} {
  const reduceMotion = useReducedMotion() === true;
  const popupRef = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLElement | null>(null);
  const session = useRef<Session | null>(null);
  const shrinking = useRef<Animation[]>([]);
  const latest = useRef({ sourceId, open, reduceMotion });
  latest.current = { sourceId, open, reduceMotion };

  const release = useCallback(() => {
    const current = session.current;
    if (current === null) return;
    session.current = null;
    viewport.current?.removeAttribute("data-morph");
    for (const animation of current.running) animation.cancel();
    current.hidden.cancel();
    current.source.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: RESTORE_MS,
      easing: EASE_OUT,
    });
  }, []);

  const viewportRef = useCallback((element: HTMLElement | null) => {
    viewport.current = element;
    if (element === null) return;
    // The sheet turned into a dialog (or back) while open: it still shrinks into the control. A
    // growth that was under way stays with the old elements.
    if (session.current !== null) {
      if (element !== session.current.viewport) {
        for (const animation of session.current.running) animation.cancel();
        session.current.running = [];
        session.current.viewport = element;
      }
      element.setAttribute("data-morph", "");
      return;
    }
    const { sourceId, open, reduceMotion } = latest.current;
    const popup = popupRef.current;
    if (sourceId === undefined || !open || reduceMotion || popup === null) return;
    // Safari before 17.2 throws on the `linear()` easing of the spring.
    if (
      typeof element.animate !== "function" ||
      !CSS.supports("animation-timing-function", "linear(0, 1)")
    ) {
      return;
    }
    const source = findSource(sourceId);
    if (source === null || !onScreen(source)) return;
    session.current = grow(element, popup, source);
  }, []);

  const wasOpen = useRef(open);
  useLayoutEffect(() => {
    if (wasOpen.current === open) return;
    wasOpen.current = open;
    if (open) {
      // Open again before the shrink has ended, in a host that keeps the sheet mounted: the sheet
      // shows as it is, without a morph.
      const leftover = shrinking.current;
      shrinking.current = [];
      if (session.current === null && leftover.some((a) => a.playState === "running")) {
        for (const animation of leftover) animation.cancel();
        viewport.current?.removeAttribute("data-morph");
      }
      return;
    }
    const current = session.current;
    const element = viewport.current;
    const popup = popupRef.current;
    if (current === null) return;
    if (element === null || popup === null || !onScreen(current.source)) {
      release();
      return;
    }
    session.current = null;
    shrinking.current = shrink(element, popup, current);
  }, [open, release]);

  useEffect(() => {
    if (!open || !("navigation" in window)) return;
    const onNavigate = (event: NavigateEvent) => {
      if (event.hasUAVisualTransition) release();
    };
    navigation.addEventListener("navigate", onNavigate);
    return () => navigation.removeEventListener("navigate", onNavigate);
  }, [open, release]);

  // Unmounted while open (a new sheet replaced this one): the control comes back.
  useEffect(
    () => () => {
      session.current?.hidden.cancel();
      session.current = null;
    },
    [],
  );

  return { viewportRef, popupRef, release };
}

function grow(viewport: HTMLElement, popup: HTMLElement, source: HTMLElement): Session {
  viewport.setAttribute("data-morph", "");
  // Base UI has styled the popup at the start of its slide already, so `data-morph` has started a
  // transition to where the sheet rests: skip it, then measure the sheet there.
  for (const animation of popup.getAnimations()) {
    if (animation instanceof CSSTransition) animation.finish();
  }
  const frame = viewport.getBoundingClientRect();
  const sheet = popup.getBoundingClientRect();

  const shape = viewport.animate(
    {
      clipPath: [inset(source, frame), inset(popup, frame, sheet)],
      backgroundColor: [colorOf(source), colorOf(popup)],
    },
    sheetTiming,
  );
  const running = [
    shape,
    viewport.animate([{ opacity: 0 }, { opacity: 1 }], { duration: HANDOFF_MS, easing: EASE_OUT }),
    popup.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: CONTENT_FADE_MS,
      delay: CONTENT_DELAY_MS,
      easing: EASE_OUT,
      fill: "backwards",
    }),
  ];
  shape.finished.then(
    () => popup.animate([{ boxShadow: "none", offset: 0 }], { duration: SHADOW_FADE_MS }),
    () => {},
  );
  const hidden = source.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: HANDOFF_MS,
    easing: EASE_OUT,
    fill: "forwards",
  });
  return { source, viewport, hidden, running };
}

function shrink(
  viewport: HTMLElement,
  popup: HTMLElement,
  { source, hidden, running }: Session,
): Animation[] {
  const frame = viewport.getBoundingClientRect();
  // From wherever the growth got to, when the sheet closes before it has finished.
  const growing = running.some((animation) => animation.playState === "running");
  const now = getComputedStyle(viewport);
  const from = growing
    ? { clipPath: now.clipPath, backgroundColor: now.backgroundColor, opacity: now.opacity }
    : { clipPath: inset(popup, frame), backgroundColor: colorOf(popup), opacity: "1" };
  const contentOpacity = getComputedStyle(popup).opacity;
  for (const animation of running) animation.cancel();

  const landing = (sheetTiming.duration - HANDOFF_MS) / sheetTiming.duration;
  const shape = viewport.animate(
    {
      clipPath: [from.clipPath, inset(source, frame)],
      backgroundColor: [from.backgroundColor, colorOf(source)],
    },
    { ...sheetTiming, fill: "forwards" },
  );
  const handoff = viewport.animate(
    [
      { offset: 0, opacity: from.opacity },
      { offset: landing, opacity: 1, easing: EASE_OUT },
      { offset: 1, opacity: 0 },
    ],
    { duration: sheetTiming.duration, fill: "forwards" },
  );
  // As long as the shape moves: the sheet unmounts when the animations of its popup end.
  const content = popup.animate(
    [
      { offset: 0, opacity: contentOpacity, easing: EASE_OUT },
      { offset: HANDOFF_MS / sheetTiming.duration, opacity: 0 },
      { offset: 1, opacity: 0 },
    ],
    { duration: sheetTiming.duration, fill: "forwards" },
  );
  hidden.cancel();
  source.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: HANDOFF_MS,
    delay: sheetTiming.duration - HANDOFF_MS,
    easing: EASE_OUT,
    fill: "backwards",
  });
  return [shape, handoff, content];
}

function findSource(id: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[${SOURCE_ATTRIBUTE}="${CSS.escape(id)}"]`);
}

function onScreen(element: HTMLElement): boolean {
  if (!element.isConnected) return false;
  const rect = element.getBoundingClientRect();
  return (
    rect.width > 0 &&
    rect.bottom > 0 &&
    rect.right > 0 &&
    rect.top < window.innerHeight &&
    rect.left < window.innerWidth
  );
}

/** The box of an element as an inset of the viewport, with the element's corner radius. */
function inset(element: HTMLElement, frame: DOMRect, rect = element.getBoundingClientRect()) {
  const top = rect.top - frame.top;
  const right = frame.right - rect.right;
  const bottom = frame.bottom - rect.bottom;
  const left = rect.left - frame.left;
  return `inset(${top}px ${right}px ${bottom}px ${left}px round ${radiusOf(element)}px)`;
}

/**
 * The plain radius that looks like the element's corner. A clip has no `corner-shape`, so a
 * squircle's radius goes back to its circular fallback.
 */
function radiusOf(element: HTMLElement): number {
  const style = getComputedStyle(element);
  const k = Number.parseFloat(style.getPropertyValue("--squircle-k")) || 1;
  return Number.parseFloat(style.borderTopLeftRadius) / k;
}

function colorOf(element: HTMLElement): string {
  return getComputedStyle(element).backgroundColor;
}
