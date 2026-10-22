// Habits for the tests of this package. Not exported from the package.
import type { Habit, Option } from "./habit";
import type { HabitId, OptionId } from "./ids";

export type HabitOf<K extends Habit["kind"]> = Extract<Habit, { kind: K }>;

let count = 0;

function base() {
  count += 1;
  return {
    id: `habit-${count}` as HabitId,
    name: `Habit ${count}`,
    description: "",
    icon: { type: "phosphor", name: "circle" } as const,
    color: "blue" as const,
    direction: "build" as const,
    order: "a0",
    createdAt: 1,
    updatedAt: 1,
  };
}

export function checkHabit(fields: Partial<HabitOf<"check">> = {}): HabitOf<"check"> {
  return { ...base(), kind: "check", ...fields };
}

export function numberHabit(fields: Partial<HabitOf<"number">> = {}): HabitOf<"number"> {
  return { ...base(), kind: "number", step: 1, ...fields };
}

export function choiceHabit(
  options: Option[],
  fields: Partial<HabitOf<"choice">> = {},
): HabitOf<"choice"> {
  return { ...base(), kind: "choice", options, ...fields };
}

export function scaleHabit(
  options: Option[],
  fields: Partial<HabitOf<"scale">> = {},
): HabitOf<"scale"> {
  return { ...base(), kind: "scale", options, ...fields };
}

export function textHabit(fields: Partial<HabitOf<"text">> = {}): HabitOf<"text"> {
  return { ...base(), kind: "text", ...fields };
}

/** An Option whose id is its label in lower case. */
export function option(label: string, fields: Partial<Option> = {}): Option {
  return { id: label.toLowerCase() as OptionId, label, ...fields };
}

export function optionId(label: string): OptionId {
  return label.toLowerCase() as OptionId;
}
