import type { Direction, HabitColor, HabitIcon as HabitIconValue, Kind } from "@habit/core";
import { CellSignalHighIcon } from "@phosphor-icons/react/dist/csr/CellSignalHigh";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { HashIcon } from "@phosphor-icons/react/dist/csr/Hash";
import { ListBulletsIcon } from "@phosphor-icons/react/dist/csr/ListBullets";
import { TextAaIcon } from "@phosphor-icons/react/dist/csr/TextAa";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, type InputHTMLAttributes, type ReactNode, type Ref } from "react";

import { DaySquare } from "@/components/day-square";
import { HabitIcon } from "@/components/habit-icon";
import { springs } from "@/components/motion";
import { habitColorStyle } from "@/components/palette";
import { cn } from "@/lib/utils";

import { FieldMessage, fieldClass, Segmented, type SegmentOption } from "./controls";
import { parseDecimal, tapsToFill, type FormState } from "./draft";

/**
 * The icon of the habit, large, on a tile tinted with its color: the one place in the form where
 * the habit already looks like itself. A tap opens the icon picker. A new icon or color crossfades.
 */
export function IconTile({
  icon,
  color,
  onClick,
  size = "large",
}: {
  icon: HabitIconValue;
  color: HabitColor;
  /** Without it, the tile is only a picture (inside another control). */
  onClick?: () => void;
  size?: "large" | "small";
}) {
  const reduceMotion = useReducedMotion() === true;
  const key = icon.type === "emoji" ? `e:${icon.emoji}` : `p:${icon.name}`;
  const large = size === "large";
  const className = cn(
    "relative grid flex-none place-items-center overflow-hidden bg-[color-mix(in_oklab,var(--c)_16%,var(--surface))] transition-[background-color,scale] duration-200 ease-out",
    large ? "size-[4.5rem] squircle-[1.25rem]" : "size-11 squircle-[0.75rem]",
  );
  const content = (
    <AnimatePresence initial={false} mode="popLayout">
      <motion.span
        key={key}
        className="grid place-items-center"
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.6, filter: "blur(4px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.6, filter: "blur(4px)" }}
        transition={reduceMotion ? { duration: 0.18 } : springs.fill}
      >
        <HabitIcon icon={icon} color={color} size={large ? "2.375rem" : "1.5rem"} />
      </motion.span>
    </AnimatePresence>
  );
  if (onClick === undefined) {
    return (
      <span aria-hidden style={habitColorStyle(color)} className={className}>
        {content}
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Change icon"
      style={habitColorStyle(color)}
      className={cn(className, "active:scale-[0.95]")}
    >
      {content}
    </button>
  );
}

/** A text field with a visible label above it, and its message under it. */
export function LabeledField({
  label,
  message,
  className,
  ref,
  ...input
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  message?: string | undefined;
  ref?: Ref<HTMLInputElement>;
}) {
  const id = useId();
  const messageId = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-[0.875rem] font-medium leading-5 text-ink-3">
        {label}
      </label>
      <input
        ref={ref}
        id={id}
        autoComplete="off"
        aria-invalid={message === undefined ? undefined : true}
        aria-describedby={message === undefined ? undefined : messageId}
        {...input}
        className={fieldClass}
      />
      <FieldMessage id={messageId} message={message} />
    </div>
  );
}

/** The name, large, and the description under it. */
export function NameFields({
  name,
  description,
  onName,
  onDescription,
  onBlurName,
  onBlurDescription,
  onEnter,
  message,
  nameRef,
}: {
  name: string;
  description: string;
  onName: (name: string) => void;
  onDescription: (description: string) => void;
  onBlurName?: () => void;
  onBlurDescription?: () => void;
  /** Return in the name field: the next step, or the create. */
  onEnter?: () => void;
  message: string | undefined;
  nameRef?: Ref<HTMLInputElement>;
}) {
  const messageId = useId();
  return (
    <div className="flex flex-col gap-2">
      <div>
        <input
          ref={nameRef}
          value={name}
          onChange={(event) => onName(event.target.value)}
          onBlur={onBlurName}
          onKeyDown={(event) => {
            if (event.key === "Enter" && onEnter !== undefined) {
              event.preventDefault();
              onEnter();
            }
          }}
          aria-label="Name"
          placeholder="Name"
          autoComplete="off"
          autoCapitalize="sentences"
          enterKeyHint={onEnter === undefined ? "done" : "next"}
          aria-invalid={message === undefined ? undefined : true}
          aria-describedby={message === undefined ? undefined : messageId}
          className={cn(
            fieldClass,
            "h-[3.25rem] text-[1.1875rem] font-semibold tracking-[-0.01em]",
          )}
        />
        <FieldMessage id={messageId} message={message} />
      </div>
      <input
        value={description}
        onChange={(event) => onDescription(event.target.value)}
        onBlur={onBlurDescription}
        aria-label="Description"
        placeholder="Description (optional)"
        autoComplete="off"
        autoCapitalize="sentences"
        enterKeyHint="done"
        className={cn(fieldClass, "text-ink-2")}
      />
    </div>
  );
}

export const KIND_ICONS: Record<Kind, ReactNode> = {
  check: <CheckIcon weight="bold" />,
  number: <HashIcon weight="bold" />,
  choice: <ListBulletsIcon weight="bold" />,
  scale: <CellSignalHighIcon weight="bold" />,
  text: <TextAaIcon weight="bold" />,
};

/** What each Kind records, with an example, in the words of the glossary. */
export const KIND_HINTS: Record<Kind, string> = {
  check: "Done or not done. A tap fills the day.",
  number: "A quantity, such as glasses of water.",
  choice: "One option from a list, such as the type of workout.",
  scale: "One step of an ordered list, such as mood from low to great.",
  text: "A short note for the day.",
};

export const KIND_LABELS: Record<Kind, string> = {
  check: "Check",
  number: "Number",
  choice: "Choice",
  scale: "Scale",
  text: "Text",
};

const KIND_OPTIONS: readonly SegmentOption<Kind>[] = (Object.keys(KIND_LABELS) as Kind[]).map(
  (kind) => ({ value: kind, label: KIND_LABELS[kind], icon: KIND_ICONS[kind] }),
);

export function KindField({ value, onChange }: { value: Kind; onChange: (kind: Kind) => void }) {
  return (
    <div>
      <Segmented label="Kind" value={value} onChange={onChange} options={KIND_OPTIONS} tall />
      <Hint id={value}>{KIND_HINTS[value]}</Hint>
    </div>
  );
}

const DIRECTION_OPTIONS: readonly SegmentOption<Direction>[] = [
  { value: "build", label: "Build" },
  { value: "quit", label: "Quit" },
];

const DIRECTION_HINTS: Record<Direction, string> = {
  build: "To do it, or more of it.",
  quit: "To stop it, or do less of it.",
};

export function DirectionField({
  value,
  onChange,
}: {
  value: Direction;
  onChange: (direction: Direction) => void;
}) {
  return (
    <div>
      <Segmented label="Direction" value={value} onChange={onChange} options={DIRECTION_OPTIONS} />
      <Hint id={value}>{DIRECTION_HINTS[value]}</Hint>
    </div>
  );
}

/** A quiet line under a control that changes with it: the old line fades out, the new fades in. */
function Hint({ id, children }: { id: string; children: ReactNode }) {
  const reduceMotion = useReducedMotion() === true;
  return (
    <div className="relative mt-2 min-h-5 text-[0.875rem] leading-5 text-ink-3">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.p
          key={id}
          initial={{ opacity: 0, filter: reduceMotion ? "blur(0px)" : "blur(2px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: reduceMotion ? "blur(0px)" : "blur(2px)" }}
          transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
        >
          {children}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

/**
 * The fields of a number habit: the unit, the Target ("Limit" for a quit habit) and the Step, and
 * under them the taps that fill a day, drawn as the gauges of the list.
 */
export function NumberFields({
  form,
  onChange,
  onBlur,
  messages,
}: {
  form: Pick<FormState, "unit" | "target" | "step" | "direction" | "color">;
  onChange: (patch: Partial<Pick<FormState, "unit" | "target" | "step">>) => void;
  onBlur?: (field: "unit" | "target" | "step") => void;
  messages: { target?: string | undefined; step?: string | undefined };
}) {
  const quit = form.direction === "quit";
  return (
    <div className="flex flex-col gap-4">
      <LabeledField
        label="Unit"
        value={form.unit}
        onChange={(event) => onChange({ unit: event.target.value })}
        onBlur={() => onBlur?.("unit")}
        placeholder="Optional, such as glasses"
        autoCapitalize="none"
        enterKeyHint="next"
      />
      <div className="grid grid-cols-2 gap-3">
        <LabeledField
          label={quit ? "Limit" : "Target"}
          value={form.target}
          onChange={(event) => onChange({ target: event.target.value })}
          onBlur={() => onBlur?.("target")}
          placeholder="None"
          inputMode="decimal"
          enterKeyHint="next"
          className="tabular-nums"
          message={messages.target}
        />
        <LabeledField
          label="Step"
          value={form.step}
          onChange={(event) => onChange({ step: event.target.value })}
          onBlur={() => onBlur?.("step")}
          placeholder="1"
          inputMode="decimal"
          enterKeyHint="done"
          className="tabular-nums"
          message={messages.step}
        />
      </div>
      <TapsPreview form={form} />
    </div>
  );
}

/** At most this many gauges in the preview; more taps show the first ones, a gap, and the full one. */
const PREVIEW_SQUARES = 5;

function TapsPreview({
  form,
}: {
  form: Pick<FormState, "target" | "step" | "direction" | "color">;
}) {
  const taps = tapsToFill(form);
  if (taps === undefined) return null;
  const step = parseDecimal(form.step) ?? 1;
  const target = parseDecimal(form.target) ?? step;
  const quit = form.direction === "quit";
  const count = taps ?? 1;
  const steps =
    count <= PREVIEW_SQUARES
      ? Array.from({ length: count }, (_, i) => i + 1)
      : [1, 2, 3, null, count];
  const caption =
    taps === null
      ? "Any value above 0 fills the day."
      : taps === 1
        ? quit
          ? "One tap reaches the limit."
          : "One tap fills the day."
        : quit
          ? `${taps.toLocaleString("en")} taps reach the limit.`
          : `${taps.toLocaleString("en")} taps fill the day.`;
  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-none items-center gap-1" aria-hidden>
        {steps.map((tap, index) =>
          tap === null ? (
            <span key="gap" className="w-3 text-center text-[0.875rem] leading-none text-ink-3">
              …
            </span>
          ) : (
            <DaySquare
              key={index}
              color={form.color}
              intensity={taps === null ? 1 : Math.min((tap * step) / target, 1)}
              size="1.25rem"
            />
          ),
        )}
      </div>
      <p className="min-w-0 text-[0.875rem] leading-5 text-ink-3 tabular-nums">{caption}</p>
    </div>
  );
}
