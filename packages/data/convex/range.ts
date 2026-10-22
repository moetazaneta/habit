import type { Day } from "@habit/core";

/**
 * The first and the last possible Day of a Month ("YYYY-MM"): strings that sort around all its
 * Days, also when the Month has fewer than 31.
 */
export function monthRange(month: string): { from: Day; to: Day } {
  return { from: `${month}-01` as Day, to: `${month}-31` as Day };
}
