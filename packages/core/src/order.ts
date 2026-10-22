import { generateKeyBetween } from "fractional-indexing";

/**
 * A fractional-index key that sorts between `before` and `after` (either can be missing). Moving a
 * Habit changes only its own `order`, so a reorder is one small write that syncs well. The keys
 * sort by a plain comparison of their text (`<`), not by `localeCompare`.
 *
 * Two Habits can have the same order, for example after two devices created a Habit at the same
 * time. There is no key between equal neighbours, so for those the key sorts after both.
 */
export function orderBetween(before?: string, after?: string): string {
  return generateKeyBetween(before, before !== undefined && before === after ? undefined : after);
}
