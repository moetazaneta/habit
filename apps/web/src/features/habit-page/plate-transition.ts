import type { AnyRouter } from "@tanstack/react-router";

/**
 * The shared-element transition between a row of the list and the page of its habit: the icon and
 * the name of the row (its identity plate) move and grow into the title of the page, and shrink
 * back into the row on the way back, while the rest of the screen crossfades. It uses the View
 * Transitions API through the router; a browser without it navigates without the transition.
 *
 * The way back animates from the page's Back button, and from the browser's back when the browser
 * says that it draws no animation of its own (`hasUAVisualTransition`): the back swipe on iOS
 * already slides the page away, and a second animation on top of it would play twice.
 *
 * While a view transition runs, the browser gives every pointer event to the document, so a tap
 * on the page would be lost. The move is short (320ms, see habit-page.css), and a finger that
 * lands during it ends the transition at once and taps where it landed.
 */
export const PLATE_ICON = "habit-plate-icon";
export const PLATE_NAME = "habit-plate-name";

let marked: HTMLElement[] = [];

/**
 * Prepares the transition of a row that is about to open its page. With `plate`, names the icon
 * and the name of the row, so the transition can pair them with the title of the page (`head` is
 * the row's link: the icon, then the name; only one row may carry the names, so the previous row
 * loses them). Without it (reduced motion), the screens only crossfade.
 */
export function markPlate(head: HTMLElement, { plate = true }: { plate?: boolean } = {}): void {
  passTapsThrough();
  unmark();
  if (plate) mark(head);
}

/**
 * Prepares the way back from the page of a habit to the list, before the router goes there: the
 * router runs the transition, and with `plate` the row of the habit (its link carries
 * `data-plate` with the habit's id) takes the names as soon as the list has rendered, so the title
 * of the page shrinks into it. Without it (reduced motion, the keyboard), the screens only
 * crossfade.
 */
export function markReturn(
  router: AnyRouter,
  habitId: string,
  { plate = true }: { plate?: boolean } = {},
): void {
  passTapsThrough();
  unmark();
  router.shouldViewTransition = true;
  if (!plate) return;
  const stop = router.subscribe("onRendered", () => {
    stop();
    const head = document.querySelector<HTMLElement>(`[data-plate="${CSS.escape(habitId)}"]`);
    if (head !== null) mark(head);
  });
}

function mark(head: HTMLElement): void {
  const [icon, name] = Array.from(head.children) as HTMLElement[];
  if (icon === undefined || name === undefined) return;
  icon.style.viewTransitionName = PLATE_ICON;
  name.style.viewTransitionName = PLATE_NAME;
  marked = [icon, name];
}

function unmark(): void {
  for (const element of marked) element.style.viewTransitionName = "";
  marked = [];
}

/** How long after a click the transition can still run (the screen loads, then moves). */
const TRANSITION_WINDOW_MS = 1500;
/** A press that moves farther than this is not a tap. */
const TAP_SLOP_PX = 10;

let stopPassing: (() => void) | undefined;

/**
 * For the time of the transition, a pointer that goes down ends it and, if it lifts as a tap,
 * clicks the control under it once the page is in place. A click without a pointer is what Enter
 * gives, so the calendar takes it as a tap on the Day.
 */
function passTapsThrough(): void {
  stopPassing?.();
  const onDown = (down: PointerEvent) => {
    const ended = endTransition();
    if (ended === null) return;
    const onUp = (up: PointerEvent) => {
      if (up.pointerId !== down.pointerId) return;
      window.removeEventListener("pointerup", onUp, true);
      if (Math.hypot(up.clientX - down.clientX, up.clientY - down.clientY) > TAP_SLOP_PX) return;
      // The overlay of the transition goes away a frame after it ends; until then it is the only
      // thing under the finger.
      void ended.then(() =>
        requestAnimationFrame(() =>
          requestAnimationFrame(() =>
            document
              .elementFromPoint(down.clientX, down.clientY)
              ?.closest<HTMLElement>("button:not(:disabled), a[href]")
              ?.click(),
          ),
        ),
      );
    };
    window.addEventListener("pointerup", onUp, true);
  };
  document.addEventListener("pointerdown", onDown, true);
  const timer = window.setTimeout(() => stopPassing?.(), TRANSITION_WINDOW_MS);
  stopPassing = () => {
    document.removeEventListener("pointerdown", onDown, true);
    window.clearTimeout(timer);
    stopPassing = undefined;
  };
}

/**
 * Ends the running view transition: skips it where the browser exposes it
 * (`document.activeViewTransition`), else finishes its animations. Resolves when the new page is
 * in place; null when no transition runs.
 */
function endTransition(): Promise<void> | null {
  const active = (document as Document & { activeViewTransition?: ViewTransition | null })
    .activeViewTransition;
  if (active !== undefined) {
    if (active === null) return null;
    active.skipTransition();
    return active.finished.catch(() => {});
  }
  const running = document
    .getAnimations()
    .filter((animation) =>
      (animation.effect as KeyframeEffect | null)?.pseudoElement?.startsWith("::view-transition"),
    );
  if (running.length === 0) return null;
  for (const animation of running) animation.finish();
  return Promise.resolve();
}
