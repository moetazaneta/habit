import { v7 } from "uuid";

/** The identity of a Habit: a UUIDv7 that the client makes (ADR 0002). */
export type HabitId = string & { readonly __brand: "HabitId" };

/** The stable identity of an Option of a choice or scale Habit. */
export type OptionId = string & { readonly __brand: "OptionId" };

/** A new UUIDv7: it starts with the time, so ids made later sort after ids made earlier. */
export function newId(): string {
  return v7();
}
