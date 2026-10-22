import type { Day, HabitState } from "@habit/core";
import type { ReactNode } from "react";

import type { AuthState } from "../api";

/**
 * An in-memory provider for tests and for UI work without a backend (`VITE_HABIT_DATA=fake`).
 * It implements `HabitDataApi` with `applyAction` and `invertAction` from @habit/core.
 */
export function FakeHabitDataProvider(props: {
  /** The starting data. Default: `demoState(today())`. */
  initial?: HabitState;
  /** Default: ready, as the owner. */
  auth?: AuthState["status"];
  /** A delay before `done` resolves, to see pending states. Default 0. */
  latencyMs?: number;
  /** When true, every write fails after the delay, to see the error state. */
  failWrites?: boolean;
  children: ReactNode;
}): ReactNode {
  void props;
  throw new Error("@habit/data/testing: FakeHabitDataProvider is not implemented yet");
}

/**
 * The demo data of the design sketches: 11 habits (Water, Read, Meditate, Gym, Mood, Sleep,
 * Smoking, Coffee, Journal, Spanish, Vitamins) with Entries for the 30 Days that end at `today`.
 */
export function demoState(today: Day): HabitState {
  void today;
  throw new Error("@habit/data/testing: demoState is not implemented yet");
}
