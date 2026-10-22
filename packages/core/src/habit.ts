import type { HabitColor } from "./palette";
import { newId, type HabitId, type OptionId } from "./ids";
import { orderBetween } from "./order";

export type Kind = "check" | "number" | "choice" | "scale" | "text";

/** `build`: the person wants to do it, or more of it. `quit`: to stop it, or less of it. */
export type Direction = "build" | "quit";

/** An emoji, or the name of a Phosphor icon such as "drop" (drawn in the duotone weight). */
export type HabitIcon = { type: "emoji"; emoji: string } | { type: "phosphor"; name: string };

export interface Option {
  id: OptionId;
  label: string;
  emoji?: string;
  /** Set when the person removed an Option that Entries use: not offered for new Entries. */
  retiredAt?: number;
}

interface HabitBase {
  id: HabitId;
  name: string;
  description: string;
  icon: HabitIcon;
  color: HabitColor;
  direction: Direction;
  /** A fractional index: the list sorts Habits by this string. See `orderBetween`. */
  order: string;
  /** Milliseconds since the epoch, from the client. The last write wins (ADR 0002). */
  createdAt: number;
  updatedAt: number;
  /** Soft delete (ADR 0002). A deleted Habit is hidden and can be restored. */
  deletedAt?: number;
}

export type Habit = HabitBase &
  (
    | { kind: "check" }
    | {
        kind: "number";
        unit?: string;
        /** The quantity that fills a Day completely. For a quit Habit, the accepted limit. */
        target?: number;
        /** The quantity that one tap adds. Default 1. */
        step: number;
      }
    | { kind: "choice"; options: Option[] }
    | { kind: "scale"; options: Option[] }
    | { kind: "text" }
  );

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

/** What the create form collects: a Habit without the fields that `createHabit` fills in. */
export type HabitDraft = DistributiveOmit<
  Habit,
  "id" | "order" | "createdAt" | "updatedAt" | "deletedAt"
>;

/** The fields that an edit can change. The Kind and the id never change after creation. */
export type HabitPatch = Partial<
  Pick<HabitBase, "name" | "description" | "icon" | "color" | "direction">
> & {
  unit?: string | null;
  target?: number | null;
  step?: number;
  options?: Option[];
};

/**
 * A complete new Habit from a draft: a new id, an order after `lastOrder`, and timestamps. Give
 * `lastOrder(state)` as `lastOrder`, so that the order is after the deleted Habits too.
 *
 * Only the fields of a Habit of the draft's Kind are copied, so a form that changed the Kind can
 * leave the fields of the old Kind in its draft. The name and the description are trimmed. (An
 * edit does not trim: each key press applies at once, so a trim would remove the space that the
 * person just typed.)
 */
export function createHabit(
  draft: HabitDraft,
  context: { now: number; lastOrder?: string },
): Habit {
  const base = {
    id: newId() as HabitId,
    name: draft.name.trim(),
    description: draft.description.trim(),
    icon: draft.icon,
    color: draft.color,
    direction: draft.direction,
    order: orderBetween(context.lastOrder),
    createdAt: context.now,
    updatedAt: context.now,
  };
  switch (draft.kind) {
    case "check":
    case "text":
      return { ...base, kind: draft.kind };
    case "number":
      return {
        ...base,
        kind: draft.kind,
        ...(draft.unit !== undefined && { unit: draft.unit }),
        ...(draft.target !== undefined && { target: draft.target }),
        step: draft.step,
      };
    case "choice":
    case "scale":
      return { ...base, kind: draft.kind, options: draft.options };
  }
}
