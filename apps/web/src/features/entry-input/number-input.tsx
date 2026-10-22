import type { Day, EntryValue, Habit } from "@habit/core";
import { useEffect, useEffectEvent, useState, type RefObject } from "react";

import { useAct } from "@/components/act";
import { formatNumber, formatQuantity } from "@/components/format";
import { haptic } from "@/components/haptics";

type NumberHabit = Extract<Habit, { kind: "number" }>;

/** A typed value applies after this pause, and at once on Enter or when the field loses focus. */
const TYPING_PAUSE_MS = 700;

/**
 * The exact value of a number Day: a field, −Step and +Step, "= Target" and "Clear". Each change
 * applies at once.
 */
export function NumberInput({
  habit,
  day,
  value,
  fieldRef,
}: {
  habit: NumberHabit;
  day: Day;
  value: EntryValue | undefined;
  fieldRef: RefObject<HTMLElement | null>;
}) {
  const act = useAct();
  const current = value?.kind === "number" ? value.value : undefined;
  const [draft, setDraft] = useState(() => plain(current));
  const [editing, setEditing] = useState(false);
  // The field follows the stored value (the buttons, an undo) while nobody types in it.
  if (!editing && draft !== plain(current)) setDraft(plain(current));

  const set = (next: number) => {
    if (next === current) return;
    act({ type: "setEntry", habitId: habit.id, day, value: { kind: "number", value: next } });
  };
  const clear = () => {
    if (current !== undefined) act({ type: "clearEntry", habitId: habit.id, day });
  };

  const commit = (text: string, final: boolean) => {
    const parsed = parseValue(text);
    if (parsed === "empty") {
      if (final) clear();
    } else if (parsed === "invalid") {
      if (final) setDraft(plain(current));
    } else {
      set(parsed);
    }
  };

  const commitTyped = useEffectEvent(() => commit(draft, false));
  useEffect(() => {
    if (!editing) return;
    const timer = window.setTimeout(commitTyped, TYPING_PAUSE_MS);
    return () => window.clearTimeout(timer);
  }, [draft, editing]);

  const targetWord = habit.direction === "quit" ? "Limit" : "Target";
  const caption =
    habit.target === undefined
      ? (habit.unit ?? "")
      : `${targetWord} ${formatQuantity(habit.target, habit.unit)}`;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="entry-stepper"
          aria-label={`Subtract ${formatNumber(habit.step)}`}
          disabled={current === undefined || current <= 0}
          onClick={() => {
            haptic();
            if (current !== undefined) set(Math.max(0, addDecimals(current, -habit.step)));
          }}
        >
          −{formatNumber(habit.step)}
        </button>
        <label className="flex min-w-0 flex-1 flex-col items-center">
          <input
            ref={fieldRef as RefObject<HTMLInputElement | null>}
            className="entry-number-field"
            type="text"
            inputMode="decimal"
            enterKeyHint="done"
            autoComplete="off"
            placeholder="0"
            aria-label={habit.unit === undefined ? "Value" : `Value in ${habit.unit}`}
            value={draft}
            data-length={draft.length > 9 ? "longer" : draft.length > 6 ? "long" : undefined}
            onFocus={() => setEditing(true)}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={() => {
              setEditing(false);
              commit(draft, true);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
            }}
          />
          <span className="line-clamp-2 text-center text-[0.8125rem] leading-4 text-ink-3">
            {caption}
          </span>
        </label>
        <button
          type="button"
          className="entry-stepper"
          aria-label={`Add ${formatNumber(habit.step)}`}
          onClick={() => {
            haptic();
            set(addDecimals(current ?? 0, habit.step));
          }}
        >
          +{formatNumber(habit.step)}
        </button>
      </div>
      <div className="flex gap-2">
        {habit.target === undefined ? null : (
          <button
            type="button"
            className="sheet-button flex-1"
            disabled={current === habit.target}
            onClick={() => set(habit.target!)}
          >
            = {targetWord}
          </button>
        )}
        <button
          type="button"
          className="sheet-button flex-1"
          disabled={current === undefined}
          onClick={clear}
        >
          Clear
        </button>
      </div>
    </div>
  );
}

function plain(value: number | undefined): string {
  return value === undefined ? "" : String(value);
}

function parseValue(text: string): number | "empty" | "invalid" {
  const trimmed = text.trim().replace(",", ".");
  if (trimmed === "") return "empty";
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : "invalid";
}

/** `a + b` without the binary rounding error: 0.2 + 0.1 is 0.3. */
function addDecimals(a: number, b: number): number {
  const places = Math.max(decimals(a), decimals(b));
  return Number((a + b).toFixed(places));
}

function decimals(value: number): number {
  const text = String(value);
  return text.includes("e") ? 0 : (text.split(".")[1]?.length ?? 0);
}
