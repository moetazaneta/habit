import type { Day, EntryValue, Habit, OptionId } from "@habit/core";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { useEffect, useRef } from "react";

import { useAct } from "@/components/act";
import { DaySquare } from "@/components/day-square";
import { haptic } from "@/components/haptics";
import { cn } from "@/lib/utils";

type OptionHabit = Extract<Habit, { kind: "choice" | "scale" }>;

/** After a pick, the sheet stays open this long, so the check is seen before it closes. */
const CLOSE_AFTER_PICK_MS = 220;

/**
 * The Options of a choice or scale Day, as a list: a tap picks one and closes the input. A scale
 * shows each Option's gauge level, from the lightest to full. A retired Option is not offered,
 * unless this Day already has it.
 */
export function OptionInput({
  habit,
  day,
  value,
  onDone,
}: {
  habit: OptionHabit;
  day: Day;
  value: EntryValue | undefined;
  onDone: () => void;
}) {
  const act = useAct();
  const selected = value?.kind === habit.kind ? value.optionId : undefined;
  const closing = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(closing.current), []);

  const finish = () => {
    window.clearTimeout(closing.current);
    closing.current = window.setTimeout(onDone, CLOSE_AFTER_PICK_MS);
  };

  const pick = (optionId: OptionId) => {
    haptic();
    if (optionId !== selected) {
      const next =
        habit.kind === "choice"
          ? { kind: "choice" as const, optionId }
          : { kind: "scale" as const, optionId };
      act({ type: "setEntry", habitId: habit.id, day, value: next });
    }
    finish();
  };

  const offered = habit.options.filter(
    (option) => option.retiredAt === undefined || option.id === selected,
  );

  return (
    <div className="flex flex-col gap-3">
      <div role="radiogroup" aria-label={habit.name} className="flex flex-col">
        {offered.map((option) => {
          const position = habit.options.indexOf(option);
          const checked = option.id === selected;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={checked}
              className={cn("entry-option", checked && "entry-option-checked")}
              onClick={() => pick(option.id)}
            >
              {habit.kind === "scale" ? (
                <DaySquare
                  color={habit.color}
                  intensity={(position + 1) / habit.options.length}
                  size="1.25rem"
                  animated={false}
                />
              ) : (
                <span
                  className="grid size-5 place-items-center text-[1.0625rem] leading-none"
                  aria-hidden
                >
                  {option.emoji ?? ""}
                </span>
              )}
              <span className="min-w-0 flex-1 truncate">{option.label}</span>
              <CheckIcon weight="bold" className="entry-option-check" aria-hidden />
            </button>
          );
        })}
      </div>
      <button
        type="button"
        className="sheet-button"
        disabled={selected === undefined}
        onClick={() => {
          act({ type: "clearEntry", habitId: habit.id, day });
          finish();
        }}
      >
        Clear
      </button>
    </div>
  );
}
