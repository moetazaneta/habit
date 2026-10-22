import type { Action, Day, Entry, EntryKey, Habit, HabitId, HabitState } from "@habit/core";
import { applyAction, entryKey, parseDay } from "@habit/core";
import type { Infer } from "convex/values";
import { ConvexError, v } from "convex/values";

import type { Doc } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { authMutation, authQuery } from "./functions";
import { vAction, vData, vDay } from "./validators";

type Data = Infer<typeof vData>;

/**
 * All Habits of the caller (also deleted ones, for undo) and the Entries from `from` to `to`
 * (inclusive). The client subscribes to the live window with it: the 13 months up to today.
 */
export const days = authQuery({
  args: { from: vDay, to: vDay },
  returns: vData,
  handler: async (ctx, { from, to }): Promise<Data> => ({
    habits: await habitsOf(ctx, ctx.userId),
    entries: await entriesBetween(ctx, ctx.userId, from, to),
  }),
});

/** The Entries of one Month ("YYYY-MM"), for a Month older than the live window. No Habits. */
export const month = authQuery({
  args: { month: v.string() },
  returns: vData,
  handler: async (ctx, { month }): Promise<Data> => {
    if (!/^\d{4}-\d{2}$/.test(month)) throw new ConvexError({ code: "badMonth", month });
    const { from, to } = monthRange(month);
    return { habits: [], entries: await entriesBetween(ctx, ctx.userId, from, to) };
  },
});

/**
 * Applies one Action with `applyAction` of @habit/core, the same function that the client uses for
 * its optimistic update. `now` is the time of the Action on the client: it becomes the `updatedAt`
 * of each changed row, and a row that is already newer keeps its value (last write wins). A time
 * after the server's clock counts as the server's time, so a wrong clock cannot lock a row.
 */
export const perform = authMutation({
  args: { action: vAction, now: v.number() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const action: Action = args.action;
    const now = Math.min(args.now, Date.now());
    const touched = touchedRows(action);
    for (const { day } of touched.entries) checkDay(day);

    const habitDocs = new Map<HabitId, Doc<"habits">>();
    const entryDocs = new Map<EntryKey, Doc<"entries">>();
    const before: HabitState = { habits: {}, entries: {} };
    for (const id of touched.habitIds) {
      const doc = await ctx.db
        .query("habits")
        .withIndex("by_user_and_id", (q) => q.eq("userId", ctx.userId).eq("id", id))
        .unique();
      if (doc === null) continue;
      habitDocs.set(id, doc);
      before.habits[id] = toHabit(doc);
    }
    for (const { habitId, day } of touched.entries) {
      const key = entryKey(habitId, day);
      const doc = await ctx.db
        .query("entries")
        .withIndex("by_user_and_habit_and_day", (q) =>
          q.eq("userId", ctx.userId).eq("habitId", habitId).eq("day", day),
        )
        .unique();
      if (doc === null) continue;
      entryDocs.set(key, doc);
      before.entries[key] = toEntry(doc);
    }

    const after = applyAction(before, action, now);

    for (const [id, habit] of Object.entries(after.habits) as [HabitId, Habit][]) {
      if (sameRow(habit, before.habits[id])) continue;
      const doc = habitDocs.get(id);
      if (doc !== undefined && doc.updatedAt > now) continue;
      const row = { ...habit, userId: ctx.userId };
      if (doc === undefined) await ctx.db.insert("habits", row);
      else await ctx.db.replace(doc._id, row);
    }
    for (const [key, entry] of Object.entries(after.entries) as [EntryKey, Entry][]) {
      if (sameRow(entry, before.entries[key])) continue;
      const habit = after.habits[entry.habitId];
      if (habit === undefined) throw new ConvexError({ code: "unknownHabit", id: entry.habitId });
      if (entry.deletedAt === undefined && entry.value.kind !== habit.kind) {
        throw new ConvexError({ code: "wrongKind", id: entry.habitId });
      }
      const doc = entryDocs.get(key);
      if (doc !== undefined && doc.updatedAt > now) continue;
      const row = { ...entry, userId: ctx.userId };
      if (doc === undefined) await ctx.db.insert("entries", row);
      else await ctx.db.replace(doc._id, row);
    }
    return null;
  },
});

async function habitsOf(ctx: QueryCtx | MutationCtx, userId: string): Promise<Habit[]> {
  const docs = await ctx.db
    .query("habits")
    .withIndex("by_user_and_id", (q) => q.eq("userId", userId))
    .collect();
  return docs.map(toHabit);
}

/** The Entries from `from` to `to`, without the tombstones of cleared Entries. */
async function entriesBetween(ctx: QueryCtx, userId: string, from: Day, to: Day): Promise<Entry[]> {
  const docs = await ctx.db
    .query("entries")
    .withIndex("by_user_and_day", (q) => q.eq("userId", userId).gte("day", from).lte("day", to))
    .collect();
  return docs.filter((doc) => doc.deletedAt === undefined).map(toEntry);
}

/** The first and the last possible Day of a Month, as strings that sort around all its Days. */
export function monthRange(month: string): { from: Day; to: Day } {
  return { from: `${month}-01` as Day, to: `${month}-31` as Day };
}

/** The Habits and the Entries that an Action can change. */
function touchedRows(action: Action): {
  habitIds: Set<HabitId>;
  entries: { habitId: HabitId; day: Day }[];
} {
  const habitIds = new Set<HabitId>();
  const entries = new Map<EntryKey, { habitId: HabitId; day: Day }>();
  const visit = (a: Action): void => {
    switch (a.type) {
      case "setEntry":
      case "clearEntry":
        habitIds.add(a.habitId);
        entries.set(entryKey(a.habitId, a.day), { habitId: a.habitId, day: a.day });
        break;
      case "createHabit":
        habitIds.add(a.habit.id);
        break;
      case "updateHabit":
      case "moveHabit":
      case "deleteHabit":
      case "restoreHabit":
        habitIds.add(a.id);
        break;
      case "batch":
        a.actions.forEach(visit);
        break;
    }
  };
  visit(action);
  return { habitIds, entries: [...entries.values()] };
}

function checkDay(day: Day): void {
  try {
    parseDay(day);
  } catch {
    throw new ConvexError({ code: "badDay", day });
  }
}

function toHabit(doc: Doc<"habits">): Habit {
  const { _id, _creationTime, userId: _userId, ...habit } = doc;
  return habit;
}

function toEntry(doc: Doc<"entries">): Entry {
  const { _id, _creationTime, userId: _userId, ...entry } = doc;
  return entry;
}

/** True when two rows hold the same data. `applyAction` keeps the objects of unchanged rows. */
function sameRow(a: object, b: object | undefined): boolean {
  return a === b || (b !== undefined && JSON.stringify(sorted(a)) === JSON.stringify(sorted(b)));
}

function sorted(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sorted);
  if (value === null || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, item]) => item !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([key, item]) => [key, sorted(item)]),
  );
}
