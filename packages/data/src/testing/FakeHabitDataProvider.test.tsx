// @vitest-environment jsdom
import { emptyState, parseDay, type Action, type Day } from "@habit/core";
import { act, cleanup, renderHook } from "@testing-library/react";
import { useContext, type ComponentProps, type ReactNode } from "react";
import { afterEach, describe, expect, test } from "vite-plus/test";

import {
  HabitDataContext,
  useAuth,
  useEntries,
  useHabits,
  useMonth,
  usePerform,
  type PerformResult,
} from "../api";
import { demoHabitIds } from "./demoState";
import { FakeHabitDataProvider } from "./FakeHabitDataProvider";

afterEach(cleanup);

const today = parseDay("2026-10-22");
const water = demoHabitIds.water;
const meditate = demoHabitIds.meditate;

type Props = Omit<ComponentProps<typeof FakeHabitDataProvider>, "children">;

/** Renders the hooks that the apps use inside the fake provider. `props` can change later. */
function renderData(initialProps: Props = {}) {
  let props: Props = { today, ...initialProps };
  const view = renderHook(
    () => ({
      auth: useAuth(),
      ...useHabits(),
      entry: useEntries(),
      perform: usePerform(),
      api: useContext(HabitDataContext),
    }),
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <FakeHabitDataProvider {...props}>{children}</FakeHabitDataProvider>
      ),
    },
  );
  return {
    ...view,
    setProps(next: Props) {
      props = { ...props, ...next };
      view.rerender();
    },
  };
}

const setWater = (value: number, day: Day = today): Action => ({
  type: "setEntry",
  habitId: water,
  day,
  value: { kind: "number", value },
});

describe("FakeHabitDataProvider", () => {
  test("shows the demo data by default, signed in as the owner", () => {
    const { result } = renderData();
    expect(result.current.auth.status).toBe("ready");
    expect(result.current.source).toBe("live");
    expect(result.current.habits).toHaveLength(11);
    expect(result.current.entry(water, today)).toEqual({ kind: "number", value: 5 });
  });

  test("starts from the given state", () => {
    const { result } = renderData({ initial: emptyState() });
    expect(result.current.habits).toEqual([]);
  });

  test("shows an Action at once, confirms it, and its inverse undoes it", async () => {
    const { result } = renderData();
    let write!: PerformResult;
    act(() => {
      write = result.current.perform(setWater(6));
    });
    expect(result.current.entry(water, today)).toEqual({ kind: "number", value: 6 });

    await act(() => write.done);
    expect(result.current.entry(water, today)).toEqual({ kind: "number", value: 6 });

    act(() => {
      result.current.perform(write.inverse);
    });
    expect(result.current.entry(water, today)).toEqual({ kind: "number", value: 5 });
  });

  test("an undo of a paint brings back each Day", async () => {
    const { result } = renderData();
    const days = [parseDay("2026-10-19"), parseDay("2026-10-20"), today];
    const before = days.map((day) => result.current.entry(meditate, day));
    let paint!: PerformResult;
    act(() => {
      paint = result.current.perform({
        type: "batch",
        actions: days.map((day) => ({ type: "clearEntry", habitId: meditate, day })),
      });
    });
    expect(days.map((day) => result.current.entry(meditate, day))).toEqual([
      undefined,
      undefined,
      undefined,
    ]);

    await act(() => paint.done);
    act(() => {
      result.current.perform(paint.inverse);
    });
    expect(days.map((day) => result.current.entry(meditate, day))).toEqual(before);
  });

  test("with a latency, `done` waits, and the value shows in the meantime", async () => {
    const { result } = renderData({ latencyMs: 30 });
    let write!: PerformResult;
    let confirmed = false;
    act(() => {
      write = result.current.perform(setWater(7));
    });
    void write.done.then(() => (confirmed = true));
    await act(() => new Promise((resolve) => setTimeout(resolve, 5)));
    expect(confirmed).toBe(false);
    expect(result.current.entry(water, today)).toEqual({ kind: "number", value: 7 });

    await act(() => write.done);
    expect(confirmed).toBe(true);
  });

  test("a failing write shows at once, then rolls back, and `done` rejects", async () => {
    const { result } = renderData({ failWrites: true });
    let write!: PerformResult;
    act(() => {
      write = result.current.perform(setWater(7));
    });
    expect(result.current.entry(water, today)).toEqual({ kind: "number", value: 7 });

    await act(async () => {
      await expect(write.done).rejects.toThrow();
    });
    expect(result.current.entry(water, today)).toEqual({ kind: "number", value: 5 });
  });

  test("a rollback keeps the writes that succeeded", async () => {
    const view = renderData({ failWrites: true, latencyMs: 10 });
    let failed!: PerformResult;
    let saved!: PerformResult;
    act(() => {
      failed = view.result.current.perform(setWater(7));
    });
    view.setProps({ failWrites: false });
    act(() => {
      saved = view.result.current.perform({ type: "clearEntry", habitId: meditate, day: today });
    });

    await act(async () => {
      await expect(failed.done).rejects.toThrow();
      await saved.done;
    });
    expect(view.result.current.entry(water, today)).toEqual({ kind: "number", value: 5 });
    expect(view.result.current.entry(meditate, today)).toBeUndefined();
  });

  test("signed out: no data until the person signs in", () => {
    const { result } = renderData({ auth: "signedOut" });
    expect(result.current.auth.status).toBe("signedOut");
    expect(result.current.source).toBe("none");
    expect(result.current.habits).toEqual([]);

    act(() => {
      const { auth } = result.current;
      if (auth.status === "signedOut") auth.signIn();
    });
    expect(result.current.auth).toMatchObject({ status: "ready", userId: expect.any(String) });
    expect(result.current.habits).toHaveLength(11);
  });

  test("no access: shows the user id and no data, and can sign out", () => {
    const { result } = renderData({ auth: "noAccess" });
    expect(result.current.auth).toMatchObject({ status: "noAccess", userId: expect.any(String) });
    expect(result.current.habits).toEqual([]);

    act(() => {
      const { auth } = result.current;
      if (auth.status === "noAccess") auth.signOut();
    });
    expect(result.current.auth.status).toBe("signedOut");
  });

  test("follows a change of the `auth` prop", () => {
    const view = renderData({ auth: "loading" });
    expect(view.result.current.auth.status).toBe("loading");
    view.setProps({ auth: "ready" });
    expect(view.result.current.auth.status).toBe("ready");
  });

  test("keeps 13 months live, and any older Month is ready at once", () => {
    const { result } = renderData();
    expect(result.current.api?.window).toEqual({ from: "2025-10-01", to: "2026-10-22" });
    const month = renderHook(() => useMonth("2020-01" as Parameters<typeof useMonth>[0]), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <FakeHabitDataProvider today={today}>{children}</FakeHabitDataProvider>
      ),
    });
    expect(month.result.current).toBe("ready");
  });
});
