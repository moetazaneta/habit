import type { Day, HabitId, OptionId } from "@habit/core";
import { HABIT_COLORS } from "@habit/core";
import type { PropertyValidators, VString } from "convex/values";
import { v } from "convex/values";

// Validators that mirror the types of @habit/core, so that the arguments and the stored rows have
// the same shape as the domain. The branded strings (Day, HabitId, OptionId) are plain strings in
// Convex; `perform` checks the format of each Day at run time.

export const vDay = v.string() as VString<Day>;
export const vHabitId = v.string() as VString<HabitId>;
const vOptionId = v.string() as VString<OptionId>;

const vColor = v.union(...HABIT_COLORS.map((color) => v.literal(color)));

const vIcon = v.union(
  v.object({ type: v.literal("emoji"), emoji: v.string() }),
  v.object({ type: v.literal("phosphor"), name: v.string() }),
);

const vDirection = v.union(v.literal("build"), v.literal("quit"));

const vOption = v.object({
  id: vOptionId,
  label: v.string(),
  emoji: v.optional(v.string()),
  retiredAt: v.optional(v.number()),
});

const habitBase = {
  id: vHabitId,
  name: v.string(),
  description: v.string(),
  icon: vIcon,
  color: vColor,
  direction: vDirection,
  order: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
};

/** A Habit, one object for each Kind. `extra` adds fields, such as the `userId` of a stored row. */
export function habitValidator<Extra extends PropertyValidators>(extra: Extra) {
  return v.union(
    v.object({ ...extra, ...habitBase, kind: v.literal("check") }),
    v.object({
      ...extra,
      ...habitBase,
      kind: v.literal("number"),
      unit: v.optional(v.string()),
      target: v.optional(v.number()),
      step: v.number(),
    }),
    v.object({ ...extra, ...habitBase, kind: v.literal("choice"), options: v.array(vOption) }),
    v.object({ ...extra, ...habitBase, kind: v.literal("scale"), options: v.array(vOption) }),
    v.object({ ...extra, ...habitBase, kind: v.literal("text") }),
  );
}

export const vHabit = habitValidator({});

export const vEntryValue = v.union(
  v.object({ kind: v.literal("check") }),
  v.object({ kind: v.literal("number"), value: v.number() }),
  v.object({ kind: v.literal("choice"), optionId: vOptionId }),
  v.object({ kind: v.literal("scale"), optionId: vOptionId }),
  v.object({ kind: v.literal("text"), text: v.string() }),
);

export const entryFields = {
  habitId: vHabitId,
  day: vDay,
  value: vEntryValue,
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
};

export const vEntry = v.object(entryFields);

const vHabitPatch = v.object({
  name: v.optional(v.string()),
  description: v.optional(v.string()),
  icon: v.optional(vIcon),
  color: v.optional(vColor),
  direction: v.optional(vDirection),
  unit: v.optional(v.union(v.string(), v.null())),
  target: v.optional(v.union(v.number(), v.null())),
  step: v.optional(v.number()),
  options: v.optional(v.array(vOption)),
});

const leafActions = [
  v.object({ type: v.literal("setEntry"), habitId: vHabitId, day: vDay, value: vEntryValue }),
  v.object({ type: v.literal("clearEntry"), habitId: vHabitId, day: vDay }),
  v.object({ type: v.literal("createHabit"), habit: vHabit }),
  v.object({ type: v.literal("updateHabit"), id: vHabitId, patch: vHabitPatch }),
  v.object({ type: v.literal("moveHabit"), id: vHabitId, order: v.string() }),
  v.object({ type: v.literal("deleteHabit"), id: vHabitId }),
  v.object({ type: v.literal("restoreHabit"), id: vHabitId }),
] as const;

/**
 * An Action of @habit/core. Convex validators cannot be recursive, so a batch holds only Actions
 * that are not batches: the client flattens nested batches before it sends them.
 */
export const vAction = v.union(
  ...leafActions,
  v.object({ type: v.literal("batch"), actions: v.array(v.union(...leafActions)) }),
);

/** What the queries of the live window and of a Month return. */
export const vData = v.object({ habits: v.array(vHabit), entries: v.array(vEntry) });
