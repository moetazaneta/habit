import type { HabitColor } from "@habit/core";
import type { CSSProperties } from "react";

/** The CSS variable of a habit color in the current theme, such as `var(--habit-rose)`. */
export function habitColorVar(color: HabitColor): string {
  return `var(--habit-${color})`;
}

/**
 * Puts a habit's color in scope as `--c`: the gauges and the icon read it, and Tailwind's
 * `text-habit`, `bg-habit` and `border-habit` use it.
 */
export function habitColorStyle(color: HabitColor): CSSProperties {
  return { "--c": habitColorVar(color) } as CSSProperties;
}
