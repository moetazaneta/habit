import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { HABIT_COLORS, type HabitColor } from "@habit/core";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from "react";

import { springs } from "@/components/motion";
import { habitColorVar } from "@/components/palette";
import { cn } from "@/lib/utils";

/** A filled field on the sheet: no border, a squircle, 16px or more so iOS does not zoom. */
export const fieldClass =
  "h-12 w-full min-w-0 squircle-[0.75rem] bg-surface-2 px-3.5 text-ink outline-none transition-[background-color,box-shadow] duration-150 placeholder:text-ink-3 focus-visible:shadow-[inset_0_0_0_0.09375rem_var(--ink-3)] focus-visible:outline-none";

/** The label of a group of controls, such as "Color". Quiet, never an eyebrow above a heading. */
export function SectionLabel({
  id,
  hidden,
  children,
}: {
  id?: string;
  /** Read by a screen reader only. */
  hidden?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      id={id}
      className={
        hidden === true ? "sr-only" : "mb-2 text-[0.875rem] font-medium leading-5 text-ink-3"
      }
    >
      {children}
    </div>
  );
}

/**
 * The message under a field, such as "Give the habit a name." It grows in with the sheet's height
 * and fades, calm: no red, no shake (docs/build-plan.md, "Errors").
 */
export function FieldMessage({ id, message }: { id: string; message: string | undefined }) {
  const reduceMotion = useReducedMotion() === true;
  return (
    <AnimatePresence initial={false}>
      {message === undefined ? null : (
        <motion.p
          key="message"
          id={id}
          role="status"
          className="overflow-hidden text-[0.875rem] leading-5 text-ink-2"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={reduceMotion ? { duration: 0.18 } : springs.morph}
        >
          <span className="block pt-1.5">{message}</span>
        </motion.p>
      )}
    </AnimatePresence>
  );
}

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

/**
 * A segmented control (a radio group): a pill slides to the chosen segment with the lift spring.
 * Arrow keys move the choice, as in any radio group. Under reduced motion the pill moves at once.
 */
export function Segmented<T extends string>({
  label,
  value,
  onChange,
  options,
  disabled,
  tall,
  hideLabel,
}: {
  label: string;
  hideLabel?: boolean;
  value: T;
  onChange: (value: T) => void;
  options: readonly SegmentOption<T>[];
  disabled?: boolean;
  /** Icons over the labels. */
  tall?: boolean;
}) {
  const labelId = useId();
  const pillId = useId();
  const reduceMotion = useReducedMotion() === true;
  return (
    <div>
      <SectionLabel id={labelId} hidden={hideLabel}>
        {label}
      </SectionLabel>
      <RadioGroup
        aria-labelledby={labelId}
        value={value}
        onValueChange={(next) => onChange(next as T)}
        disabled={disabled}
        className="grid auto-cols-fr grid-flow-col gap-0.5 squircle-[0.75rem] bg-surface-2 p-0.5"
      >
        {options.map((option) => (
          <Radio.Root
            key={option.value}
            value={option.value}
            className={cn(
              "relative isolate flex min-w-0 select-none items-center justify-center squircle-[0.625rem] text-ink-3 transition-[color,scale] duration-150 data-checked:text-ink active:scale-[0.97] data-disabled:active:scale-100",
              tall ? "h-14 flex-col gap-0.5" : "h-10 gap-1.5",
            )}
          >
            {option.value === value ? (
              <motion.span
                layoutId={pillId}
                aria-hidden
                className="absolute inset-0 -z-10 squircle-[0.625rem] bg-surface shadow-[0_0.0625rem_0.1875rem_oklch(0_0_0/0.1)] dark:bg-surface-3"
                transition={reduceMotion ? { duration: 0 } : springs.lift}
              />
            ) : null}
            {option.icon === undefined ? null : (
              <span className="grid text-[1.125rem] leading-none" aria-hidden>
                {option.icon}
              </span>
            )}
            <span
              className={cn(
                "truncate font-medium",
                tall ? "text-[0.8125rem] leading-4" : "text-[0.9375rem] leading-5",
              )}
            >
              {option.label}
            </span>
          </Radio.Root>
        ))}
      </RadioGroup>
    </div>
  );
}

const COLOR_NAMES: Record<HabitColor, string> = Object.fromEntries(
  HABIT_COLORS.map((color) => [color, color[0]!.toUpperCase() + color.slice(1)]),
) as Record<HabitColor, string>;

/** The 16 colors of the palette as squircle swatches, 8 on a row. */
export function ColorSwatches({
  value,
  onChange,
}: {
  value: HabitColor;
  onChange: (color: HabitColor) => void;
}) {
  const labelId = useId();
  return (
    <div>
      <SectionLabel id={labelId}>Color</SectionLabel>
      <RadioGroup
        aria-labelledby={labelId}
        value={value}
        onValueChange={(next) => onChange(next as HabitColor)}
        className="-mx-1 grid grid-cols-8"
      >
        {HABIT_COLORS.map((color) => (
          <Radio.Root
            key={color}
            value={color}
            aria-label={COLOR_NAMES[color]}
            className="group grid aspect-square min-h-10 place-items-center"
            style={{ "--c": habitColorVar(color) } as CSSProperties}
          >
            <span className="grid size-[72%] place-items-center squircle-[0.5rem] bg-habit text-ground shadow-[0_0_0_0_var(--surface),0_0_0_0_var(--c)] transition-[box-shadow,scale] duration-200 ease-out group-active:scale-[0.92] group-data-checked:shadow-[0_0_0_0.125rem_var(--surface),0_0_0_0.25rem_var(--c)]">
              <CheckIcon
                weight="bold"
                aria-hidden
                className="size-[46%] opacity-0 transition-opacity duration-150 group-data-checked:opacity-100"
              />
            </span>
          </Radio.Root>
        ))}
      </RadioGroup>
    </div>
  );
}

/** A plain button in the sheet's language: the primary one is solid ink, the others quiet. */
export function SheetButton({
  variant = "primary",
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "quiet" }) {
  return (
    <button
      type="button"
      {...rest}
      className={cn(
        "flex h-12 items-center justify-center gap-2 squircle-[0.875rem] px-5 text-[1.0625rem] font-semibold transition-[scale,background-color,opacity] duration-150 ease-out active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100",
        variant === "primary" ? "bg-ink text-ground" : "bg-surface-2 text-ink-2 hover:text-ink",
        className,
      )}
    >
      {children}
    </button>
  );
}

/**
 * The buttons at the end of a step. They stick to the bottom of the sheet while the content above
 * scrolls (a long list of Options, a short desktop window, an open keyboard), so the main action
 * is always in reach. A short fade shows that content passes under them.
 */
export function StickyFooter({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-10 -mx-5 -mb-5 bg-surface px-5 pt-2 pb-5 before:pointer-events-none before:absolute before:inset-x-0 before:-top-4 before:h-4 before:bg-linear-to-b before:from-transparent before:to-surface">
      {children}
    </div>
  );
}
