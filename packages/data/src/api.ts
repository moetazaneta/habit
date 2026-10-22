import type { Action, Day, EntryValue, Habit, HabitId, HabitState, Month } from "@habit/core";
import { entryValue, visibleHabits } from "@habit/core";
import { createContext, useContext, useEffect, useMemo } from "react";

/**
 * A sign-in with a code that Clerk sends by email, in two steps. The web app offers it in
 * development, so the test users (docs/notes/data.md) can sign in. Each step rejects with an Error
 * whose message is fit to show.
 */
export interface EmailCodeSignIn {
  /** Starts a sign-in for the address and sends the code to it. */
  sendCode: (email: string) => Promise<void>;
  /** Finishes the sign-in that `sendCode` started. */
  verifyCode: (code: string) => Promise<void>;
}

/** Who is signed in, and whether they may see the data (only the owner may). */
export type AuthState =
  | { status: "loading" }
  /** `signIn` starts the Google sign-in. */
  | { status: "signedOut"; signIn: () => void; emailCode?: EmailCodeSignIn }
  /** Signed in, but not the owner. `userId` is shown so the owner can set it up. */
  | { status: "noAccess"; userId: string; signOut: () => void }
  | { status: "ready"; userId: string; signOut: () => void };

/** The result of `perform`: the inverse for undo, and the server's confirmation. */
export interface PerformResult {
  /** Perform this to undo. */
  inverse: Action;
  /** Resolves when the server confirmed the write; rejects when it failed (the screen already rolled back). */
  done: Promise<void>;
}

/**
 * What a data provider gives the apps. `HabitDataProvider` (Convex) and `FakeHabitDataProvider`
 * (in memory, for tests and UI work) both implement it; the apps use only the hooks below.
 */
export interface HabitDataApi {
  auth: AuthState;
  /** Where the data on screen comes from: nothing yet, the cached snapshot, or the live data. */
  source: "none" | "snapshot" | "live";
  /** All Habits (also deleted ones, for undo) and the Entries of the live window and retained months. */
  state: HabitState;
  /** The live window: the Days whose Entries are always loaded (13 months up to today). */
  window: { from: Day; to: Day };
  /** Keeps an older Month loaded while something shows it. Returns the release function. */
  retainMonth: (month: Month) => () => void;
  monthStatus: (month: Month) => "loading" | "ready";
  /** Applies the Action on screen at once (optimistic), then writes it. */
  perform: (action: Action) => PerformResult;
}

export const HabitDataContext = createContext<HabitDataApi | null>(null);

function useApi(): HabitDataApi {
  const api = useContext(HabitDataContext);
  if (api === null) throw new Error("@habit/data: wrap the app in a HabitDataProvider");
  return api;
}

export function useAuth(): AuthState {
  return useApi().auth;
}

/** The visible Habits in the order of the list, and where the data comes from. */
export function useHabits(): { source: HabitDataApi["source"]; habits: Habit[] } {
  const { source, state } = useApi();
  const habits = useMemo(() => visibleHabits(state), [state]);
  return { source, habits };
}

/** One Habit by id, also a deleted one (undefined when unknown). */
export function useHabit(id: HabitId): Habit | undefined {
  return useApi().state.habits[id];
}

/**
 * The whole client state: all Habits (also deleted ones) and the loaded Entries. For the queries of
 * @habit/core that read more than one Habit or Day, such as `lastOrder` for a new Habit.
 */
export function useHabitState(): HabitState {
  return useApi().state;
}

/** A function that reads the Entry value of a Habit on a Day from the loaded data. */
export function useEntries(): (habitId: HabitId, day: Day) => EntryValue | undefined {
  const { state } = useApi();
  return useMemo(() => (habitId: HabitId, day: Day) => entryValue(state, habitId, day), [state]);
}

/** Loads an older Month (outside the live window) while the component is mounted. */
export function useMonth(month: Month): "loading" | "ready" {
  const api = useApi();
  const { retainMonth } = api;
  useEffect(() => retainMonth(month), [retainMonth, month]);
  return api.monthStatus(month);
}

export function usePerform(): HabitDataApi["perform"] {
  return useApi().perform;
}
