/**
 * The fixed palette of habit colors, in hue order for the color picker. The ids are stored with
 * each Habit; the web app maps each id to a muted color for the dark theme and the light theme.
 */
export const HABIT_COLORS = [
  "rose",
  "apricot",
  "ochre",
  "sand",
  "mustard",
  "olive",
  "green",
  "jade",
  "teal",
  "sky",
  "blue",
  "slate",
  "violet",
  "mauve",
  "raspberry",
  "stone",
] as const;

export type HabitColor = (typeof HABIT_COLORS)[number];
