import { notImplemented } from "./internal";

/** The identity of a Habit: a UUIDv7 that the client makes (ADR 0002). */
export type HabitId = string & { readonly __brand: "HabitId" };

/** The stable identity of an Option of a choice or scale Habit. */
export type OptionId = string & { readonly __brand: "OptionId" };

/** A new UUIDv7. */
export function newId(): string {
  return notImplemented("newId");
}
