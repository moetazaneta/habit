// @vitest-environment edge-runtime
import type { Day, Habit, HabitId } from "@habit/core";
import { convexTest } from "convex-test";
import { afterEach, beforeEach, describe, expect, test, vi } from "vite-plus/test";

import { api } from "./_generated/api";
import schema from "./schema";
import { modules } from "./test.setup";

const OWNER = "user_owner";
const OTHER_OWNER = "user_other_owner";
const STRANGER = "user_stranger";

beforeEach(() => {
  vi.stubEnv("OWNER_USER_IDS", ` ${OWNER} , ${OTHER_OWNER} `);
});
afterEach(() => {
  vi.unstubAllEnvs();
});

function habit(id: string): Habit {
  return {
    id: id as HabitId,
    name: id,
    description: "",
    icon: { type: "emoji", emoji: "💧" },
    color: "sky",
    direction: "build",
    kind: "check",
    order: "a0",
    createdAt: 1,
    updatedAt: 1,
  };
}

function setup() {
  const t = convexTest(schema, modules);
  return {
    t,
    owner: t.withIdentity({ subject: OWNER }),
    stranger: t.withIdentity({ subject: STRANGER }),
  };
}

describe("me", () => {
  test("is null when nobody is signed in", async () => {
    const { t } = setup();
    expect(await t.query(api.users.me, {})).toBeNull();
  });

  test("tells an owner from a stranger, by the Clerk user id", async () => {
    const { t, owner, stranger } = setup();
    expect(await owner.query(api.users.me, {})).toEqual({ userId: OWNER, isOwner: true });
    expect(await t.withIdentity({ subject: OTHER_OWNER }).query(api.users.me, {})).toEqual({
      userId: OTHER_OWNER,
      isOwner: true,
    });
    expect(await stranger.query(api.users.me, {})).toEqual({ userId: STRANGER, isOwner: false });
  });

  test("nobody is an owner when OWNER_USER_IDS is not set", async () => {
    vi.stubEnv("OWNER_USER_IDS", undefined);
    const { owner } = setup();
    expect(await owner.query(api.users.me, {})).toEqual({ userId: OWNER, isOwner: false });
  });
});

describe("only an owner gets data", () => {
  const range = { from: "2026-01-01" as Day, to: "2026-12-31" as Day };

  test("a caller who is not signed in is rejected", async () => {
    const { t } = setup();
    await expect(t.query(api.data.days, range)).rejects.toThrow(/unauthenticated/);
    await expect(t.query(api.data.month, { month: "2025-01" })).rejects.toThrow(/unauthenticated/);
    await expect(
      t.mutation(api.data.perform, { action: { type: "createHabit", habit: habit("h") }, now: 1 }),
    ).rejects.toThrow(/unauthenticated/);
  });

  test("a signed-in user who is not an owner is rejected", async () => {
    const { stranger } = setup();
    await expect(stranger.query(api.data.days, range)).rejects.toThrow(/forbidden/);
    await expect(stranger.query(api.data.month, { month: "2025-01" })).rejects.toThrow(/forbidden/);
    await expect(
      stranger.mutation(api.data.perform, {
        action: { type: "createHabit", habit: habit("h") },
        now: 1,
      }),
    ).rejects.toThrow(/forbidden/);
  });
});

describe("days and month", () => {
  async function seed(t: ReturnType<typeof setup>["t"]) {
    await t.run(async (ctx) => {
      await ctx.db.insert("habits", { ...habit("water"), userId: OWNER });
      await ctx.db.insert("habits", { ...habit("read"), userId: OWNER, deletedAt: 5 });
      await ctx.db.insert("habits", { ...habit("theirs"), userId: OTHER_OWNER });
      const entry = (userId: string, habitId: string, day: string, deletedAt?: number) =>
        ctx.db.insert("entries", {
          userId,
          habitId: habitId as HabitId,
          day: day as Day,
          value: { kind: "check" },
          updatedAt: 1,
          deletedAt,
        });
      await entry(OWNER, "water", "2025-12-31");
      await entry(OWNER, "water", "2026-01-01");
      await entry(OWNER, "water", "2026-01-02", 9);
      await entry(OWNER, "water", "2026-02-28");
      await entry(OWNER, "water", "2026-03-01");
      await entry(OTHER_OWNER, "theirs", "2026-01-15");
    });
  }

  test("days returns all the caller's Habits, also deleted, and the live Entries in the range", async () => {
    const { t, owner } = setup();
    await seed(t);

    const data = await owner.query(api.data.days, {
      from: "2026-01-01" as Day,
      to: "2026-02-28" as Day,
    });

    expect(data.habits.map((h) => h.id).sort()).toEqual(["read", "water"]);
    expect(data.habits.find((h) => h.id === "read")?.deletedAt).toBe(5);
    expect(data.habits[0]).not.toHaveProperty("userId");
    expect(data.entries.map((e) => e.day)).toEqual(["2026-01-01", "2026-02-28"]);
    expect(data.entries[0]).toEqual({
      habitId: "water",
      day: "2026-01-01",
      value: { kind: "check" },
      updatedAt: 1,
    });
  });

  test("month returns the Entries of one Month only", async () => {
    const { t, owner } = setup();
    await seed(t);

    const data = await owner.query(api.data.month, { month: "2025-12" });

    expect(data).toEqual({
      habits: [],
      entries: [{ habitId: "water", day: "2025-12-31", value: { kind: "check" }, updatedAt: 1 }],
    });
  });

  test("month rejects text that is not a Month", async () => {
    const { owner } = setup();
    await expect(owner.query(api.data.month, { month: "2025-1" })).rejects.toThrow(/badMonth/);
  });
});
