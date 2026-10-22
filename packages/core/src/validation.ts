import type { HabitDraft } from "./habit";
import { notImplemented } from "./internal";

export type HabitIssue =
  | { field: "name"; code: "required" | "tooLong" }
  | { field: "target"; code: "notPositive" }
  | { field: "step"; code: "notPositive" }
  | { field: "options"; code: "tooFew" | "tooMany" | "emptyLabel" | "duplicateLabel" };

/**
 * The problems of a draft, or an empty list when it is valid.
 * - name: required after trimming, a maximum of 60 characters.
 * - number: target (when set) and step above 0.
 * - choice: 1 to 12 Options that are not retired. scale: 2 to 5. Labels not empty and unique.
 */
export function validateHabitDraft(draft: HabitDraft): HabitIssue[] {
  return notImplemented(`validateHabitDraft(${draft.kind})`);
}
