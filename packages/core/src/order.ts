import { notImplemented } from "./internal";

/**
 * A fractional-index key that sorts between `before` and `after` (either can be missing). Moving a
 * Habit changes only its own `order`, so a reorder is one small write that syncs well.
 */
export function orderBetween(before?: string, after?: string): string {
  return notImplemented(`orderBetween(${before}, ${after})`);
}
