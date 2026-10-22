import type { Direction, HabitColor, HabitIcon as HabitIconValue, Kind } from "@habit/core";
import { CellSignalHighIcon } from "@phosphor-icons/react/dist/csr/CellSignalHigh";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { HashIcon } from "@phosphor-icons/react/dist/csr/Hash";
import { ListBulletsIcon } from "@phosphor-icons/react/dist/csr/ListBullets";
import { TextAaIcon } from "@phosphor-icons/react/dist/csr/TextAa";
import { animate } from "motion";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";

import { DaySquare } from "@/components/day-square";
import { HabitIcon } from "@/components/habit-icon";
import { PULSE_VELOCITY, springs } from "@/components/motion";
import { habitColorStyle } from "@/components/palette";
import { cn } from "@/lib/utils";

import { FieldMessage, fieldClass, Segmented, type SegmentOption } from "./controls";
import { parseDecimal, tapsToFill, type FormState } from "./draft";
import { EASE_OUT, FADE_IN, FADE_OUT } from "./presence";

/**
 * The icon of the habit, large, on a tile tinted with its color: the one place in the form where
 * the habit already looks like itself. A tap opens the icon picker. The tint rises from the bottom
 * like the fill of a Day, with the same small pulse, when the create sheet opens and when the color
 * changes; a new icon crossfades. Under reduced motion both fade.
 */
export function IconTile({
  icon,
  color,
  onClick,
  size = "large",
  fillOnMount = false,
}: {
  icon: HabitIconValue;
  color: HabitColor;
  /** Without it, the tile is only a picture (inside another control). */
  onClick?: () => void;
  size?: "large" | "small";
  /** Let the tint rise when the tile appears: the welcome of a new habit. */
  fillOnMount?: boolean;
}) {
  const reduceMotion = useReducedMotion() === true;
  const tile = useRef<HTMLElement>(null);
  const key = icon.type === "emoji" ? `e:${icon.emoji}` : `p:${icon.name}`;
  const large = size === "large";
  const className = cn(
    "relative isolate grid flex-none place-items-center overflow-hidden transition-[scale] duration-150 ease-out",
    large ? "size-[4.5rem] squircle-[1.25rem]" : "size-11 squircle-[0.75rem]",
  );

  // The pulse of a rising fill, as DaySquare does it: a spring from rest, started with a velocity.
  const pulse = useCallback(() => {
    if (!reduceMotion && tile.current !== null) {
      animate(tile.current, { scale: 1 }, { ...springs.pulse, velocity: PULSE_VELOCITY });
    }
  }, [reduceMotion]);

  const content = (
    <>
      <TileFill color={color} fillOnMount={fillOnMount} onRise={pulse} />
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={key}
          className="grid place-items-center"
          initial={
            reduceMotion
              ? { opacity: 0 }
              : { opacity: 0, transform: "scale(0.9)", filter: "blur(2px)" }
          }
          animate={{
            opacity: 1,
            transform: "scale(1)",
            filter: "blur(0px)",
            transition: reduceMotion ? FADE_IN : springs.fill,
          }}
          // A suggestion can change at each key press: the old icon leaves fast, so none pile up.
          exit={
            reduceMotion
              ? { opacity: 0, transition: FADE_OUT }
              : { opacity: 0, transform: "scale(0.9)", filter: "blur(2px)", transition: FADE_OUT }
          }
        >
          <HabitIcon icon={icon} color={color} size={large ? "2.375rem" : "1.5rem"} />
        </motion.span>
      </AnimatePresence>
    </>
  );
  if (onClick === undefined) {
    return (
      <span ref={tile} aria-hidden className={className}>
        {content}
      </span>
    );
  }
  return (
    <button
      ref={(element) => {
        tile.current = element;
      }}
      type="button"
      onClick={onClick}
      aria-label="Change icon"
      className={cn(className, "active:scale-[0.95]")}
    >
      {content}
    </button>
  );
}

/** How long the welcome waits, so the fill rises after the sheet has come up, not under it. */
const WELCOME_DELAY_S = 0.22;

/**
 * The tint of the tile, as layers: a new color rises over the old one from the bottom, with the
 * fill spring of the Day gauges.
 */
function TileFill({
  color,
  fillOnMount,
  onRise,
}: {
  color: HabitColor;
  fillOnMount: boolean;
  onRise: () => void;
}) {
  const reduceMotion = useReducedMotion() === true;
  const [layers, setLayers] = useState(() => [{ color, key: 0, rise: fillOnMount }]);
  const last = layers[layers.length - 1]!;
  if (last.color !== color) setLayers([last, { color, key: last.key + 1, rise: true }]);

  useEffect(() => {
    if (!last.rise) return;
    const timer = window.setTimeout(onRise, last.key === 0 ? WELCOME_DELAY_S * 1000 : 0);
    return () => window.clearTimeout(timer);
  }, [last, onRise]);

  return layers.map((layer) => (
    <motion.span
      key={layer.key}
      aria-hidden
      className="absolute inset-0 -z-10 origin-bottom bg-[color-mix(in_oklab,var(--c)_16%,var(--surface))]"
      style={habitColorStyle(layer.color)}
      initial={layer.rise ? (reduceMotion ? { opacity: 0 } : { transform: "scaleY(0)" }) : false}
      animate={reduceMotion ? { opacity: 1 } : { transform: "scaleY(1)" }}
      transition={
        reduceMotion ? FADE_IN : { ...springs.fill, delay: layer.key === 0 ? WELCOME_DELAY_S : 0 }
      }
    />
  ));
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
          transition={{ duration: 0.16, ease: EASE_OUT }}
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
