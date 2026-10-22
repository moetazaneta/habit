import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

import { entryFields, habitValidator } from "./validators";

// The rows are keyed by the client's ids (ADR 0002): a Habit by its UUIDv7 `id`, an Entry by its
// `habitId` and `day`. Each row has the `userId` (the Clerk user id) of its owner, for a later
// multi-user mode, an `updatedAt` for last-write-wins, and a soft `deletedAt`.
export default defineSchema({
  habits: defineTable(habitValidator({ userId: v.string() })).index("by_user_and_id", [
    "userId",
    "id",
  ]),
  entries: defineTable({ userId: v.string(), ...entryFields })
    .index("by_user_and_day", ["userId", "day"])
    .index("by_user_and_habit_and_day", ["userId", "habitId", "day"]),
});
