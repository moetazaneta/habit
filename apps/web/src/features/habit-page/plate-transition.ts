import { cssSprings } from "@/components/motion";

/**
 * The shared-element transition from a row of the list to the page of its habit: the icon and the
 * name of the row (its identity plate) move and grow into the title of the page, while the rest
 * of the screen crossfades. It uses the View Transitions API through the router (`viewTransition`
 * on the row's link); a browser without it navigates without the transition.
 *
 * Only list → page animates. The way back is the back gesture, which on iOS already slides the
 * page away; a second animation on top of it would play twice.
 */
export const PLATE_ICON = "habit-plate-icon";
export const PLATE_NAME = "habit-plate-name";

let marked: HTMLElement[] = [];

/**
 * Names the icon and the name of the row that is about to open its page, so the transition can
 * pair them with the title of the page. `head` is the row's link: the icon, then the name. Only
 * one row may carry the names, so the previous row loses them.
 */
export function markPlate(head: HTMLElement): void {
  for (const element of marked) element.style.viewTransitionName = "";
  const [icon, name] = Array.from(head.children) as HTMLElement[];
  if (icon === undefined || name === undefined) return;
  icon.style.viewTransitionName = PLATE_ICON;
  name.style.viewTransitionName = PLATE_NAME;
  marked = [icon, name];
}

// The plate moves with the sheet spring of the motion grammar. CSS cannot split
// `--spring-sheet` ("550ms linear(…)") into a duration and an easing, so they get their own
// properties.
if (typeof document !== "undefined") {
  const [duration = "420ms", ...easing] = cssSprings.sheet.split(" ");
  document.documentElement.style.setProperty("--plate-duration", duration);
  document.documentElement.style.setProperty("--plate-easing", easing.join(" ") || "ease-out");
}
