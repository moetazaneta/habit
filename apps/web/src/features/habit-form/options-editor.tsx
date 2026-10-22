import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { HabitColor, Option, OptionId } from "@habit/core";
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowCounterClockwise";
import { DotsSixVerticalIcon } from "@phosphor-icons/react/dist/csr/DotsSixVertical";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { SmileyIcon } from "@phosphor-icons/react/dist/csr/Smiley";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { flushSync } from "react-dom";

import { DaySquare } from "@/components/day-square";
import { haptic } from "@/components/haptics";
import { cn } from "@/lib/utils";

import { FieldMessage, fieldClass, SectionLabel } from "./controls";
import { OPTION_LIMITS, offered, retired, scaleIntensity } from "./draft";
import { firstEmoji } from "./icon-search";
import { rowPresence } from "./presence";

export interface OptionsEditorProps {
  kind: "choice" | "scale";
  color: HabitColor;
  options: Option[];
  onLabel: (id: OptionId, label: string) => void;
  onEmoji: (id: OptionId, emoji: string | undefined) => void;
  /** Called on blur of a label or an emoji, so an edit form can save at once. */
  onBlurField?: () => void;
  onAdd: () => OptionId;
  onRemove: (id: OptionId) => void;
  onRestore: (id: OptionId) => void;
  onMove: (from: number, to: number) => void;
  message: string | undefined;
}

/**
 * The Options of a choice or a scale: a label and an optional emoji each, added, renamed, removed
 * and moved (drag the handle, or press the up and down arrow keys on it). A scale draws the fill
 * that each Option gives a day, so its order reads at a glance. Retired Options (removed, but used
 * by old Entries) wait under the list, and can come back.
 */
export function OptionsEditor(props: OptionsEditorProps) {
  const { kind, color, options, onAdd, onMove, message } = props;
  const limits = OPTION_LIMITS[kind];
  const shown = offered(options);
  const gone = retired(options);
  const labelId = useId();
  const messageId = useId();
  const hintId = useId();
  const reduceMotion = useReducedMotion() === true;
  const labels = useRef(new Map<OptionId, HTMLInputElement>());
  const handles = useRef(new Map<OptionId, HTMLButtonElement>());
  const [focusHandle, setFocusHandle] = useState<OptionId | null>(null);
  const [announcement, setAnnouncement] = useState("");

  // A keyboard move re-inserts the row, which takes the focus off its handle: give it back.
  useLayoutEffect(() => {
    if (focusHandle === null) return;
    handles.current.get(focusHandle)?.focus();
    setFocusHandle(null);
  }, [focusHandle]);

  const sensors = useSensors(useSensor(PointerSensor));

  const add = () => {
    // Render the new row now, inside the tap, so that iOS opens the keyboard for its label.
    let id: OptionId | undefined;
    flushSync(() => {
      id = onAdd();
    });
    if (id !== undefined) labels.current.get(id)?.focus();
  };

  const move = (id: OptionId, by: -1 | 1) => {
    const from = shown.findIndex((option) => option.id === id);
    const to = from + by;
    if (from < 0 || to < 0 || to >= shown.length) return;
    onMove(from, to);
    setFocusHandle(id);
    const option = shown[from]!;
    setAnnouncement(
      `${option.label.trim() || "Option"} moved to position ${to + 1} of ${shown.length}.`,
    );
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (over === null || active.id === over.id) return;
    const from = shown.findIndex((option) => option.id === active.id);
    const to = shown.findIndex((option) => option.id === over.id);
    if (from >= 0 && to >= 0) onMove(from, to);
  };

  return (
    <div>
      <SectionLabel id={labelId}>
        {kind === "scale" ? "Options, from the lightest to the fullest" : "Options"}
      </SectionLabel>
      <p id={hintId} className="sr-only">
        Drag a handle, or press the up and down arrow keys on it, to move an option.
      </p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragStart={() => haptic("lift")}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={shown.map((option) => option.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul
            role="list"
            aria-labelledby={labelId}
            aria-describedby={message === undefined ? undefined : messageId}
            className="relative flex flex-col"
          >
            <AnimatePresence initial={false}>
              {shown.map((option, index) => (
                <OptionRow
                  key={option.id}
                  {...props}
                  option={option}
                  index={index}
                  count={shown.length}
                  canRemove={shown.length > limits.min}
                  intensity={kind === "scale" ? scaleIntensity(options, option.id) : undefined}
                  hintId={hintId}
                  reduceMotion={reduceMotion}
                  labelRef={(element) => {
                    if (element === null) labels.current.delete(option.id);
                    else labels.current.set(option.id, element);
                  }}
                  handleRef={(element) => {
                    if (element === null) handles.current.delete(option.id);
                    else handles.current.set(option.id, element);
                  }}
                  onArrow={(by) => move(option.id, by)}
                  onEnter={() => {
                    const next = shown[index + 1];
                    if (next !== undefined) labels.current.get(next.id)?.focus();
                    else if (shown.length < limits.max) add();
                  }}
                  color={color}
                />
              ))}
            </AnimatePresence>
          </ul>
        </SortableContext>
      </DndContext>
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>
      <FieldMessage id={messageId} message={message} />
      {shown.length < limits.max ? (
        <button
          type="button"
          onClick={add}
          className="flex h-11 w-full items-center gap-2 squircle-[0.75rem] px-3.5 text-[1rem] font-medium text-ink-2 transition-[background-color,scale] duration-150 ease-out hover:bg-surface-2 active:scale-[0.98]"
        >
          <PlusIcon weight="bold" aria-hidden className="text-[1rem]" />
          Add option
        </button>
      ) : (
        <p className="px-1 text-[0.875rem] leading-5 text-ink-3">
          {kind === "scale" ? "A scale has 5 options at most." : "12 options at most."}
        </p>
      )}
      <AnimatePresence initial={false}>
        {gone.length === 0 ? null : (
          <motion.div key="retired" {...rowPresence(reduceMotion)}>
            <RetiredOptions
              options={gone}
              canRestore={shown.length < limits.max}
              onRestore={props.onRestore}
              reduceMotion={reduceMotion}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function OptionRow({
  option,
  index,
  count,
  canRemove,
  intensity,
  color,
  hintId,
  reduceMotion,
  labelRef,
  handleRef,
  onArrow,
  onEnter,
  onLabel,
  onEmoji,
  onBlurField,
  onRemove,
}: OptionsEditorProps & {
  option: Option;
  index: number;
  count: number;
  canRemove: boolean;
  intensity: number | undefined;
  hintId: string;
  reduceMotion: boolean;
  labelRef: (element: HTMLInputElement | null) => void;
  handleRef: (element: HTMLButtonElement | null) => void;
  onArrow: (by: -1 | 1) => void;
  onEnter: () => void;
}) {
  const { setNodeRef, setActivatorNodeRef, listeners, transform, transition, isDragging } =
    useSortable({
      id: option.id,
      // The neighbours make room with the app's ease-out; under reduced motion they move at once.
      transition: reduceMotion ? null : { duration: 200, easing: "cubic-bezier(0.23, 1, 0.32, 1)" },
    });
  const name = option.label.trim() || `option ${index + 1}`;

  const onHandleKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      onArrow(event.key === "ArrowUp" ? -1 : 1);
    }
  };

  return (
    <motion.li {...rowPresence(reduceMotion)}>
      <div
        ref={setNodeRef}
        style={{ transform: CSS.Translate.toString(transform), transition }}
        className={cn("relative pb-2", isDragging && "z-10")}
      >
        <div
          className={cn(
            "flex items-center gap-2 squircle-[0.875rem] transition-[background-color,box-shadow] duration-150",
            isDragging && "bg-surface shadow-[var(--elevation)]",
          )}
        >
          {intensity === undefined ? null : (
            <DaySquare color={color} intensity={intensity} size="1.25rem" className="ml-1" />
          )}
          <EmojiSlot
            emoji={option.emoji}
            label={name}
            onEmoji={(emoji) => onEmoji(option.id, emoji)}
            onBlur={onBlurField}
          />
          <input
            ref={labelRef}
            value={option.label}
            onChange={(event) => onLabel(option.id, event.target.value)}
            onBlur={onBlurField}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onEnter();
              }
            }}
            aria-label={`Option ${index + 1} of ${count}`}
            placeholder={`Option ${index + 1}`}
            autoComplete="off"
            autoCapitalize="sentences"
            enterKeyHint="next"
            className={cn(fieldClass, "flex-1")}
          />
          <button
            type="button"
            onClick={() => onRemove(option.id)}
            disabled={!canRemove}
            aria-label={`Remove ${name}`}
            className="grid size-11 flex-none place-items-center rounded-full text-ink-3 transition-[color,scale,opacity] duration-150 ease-out hover:text-ink active:scale-[0.95] disabled:opacity-30 disabled:active:scale-100"
          >
            <XIcon weight="bold" aria-hidden className="text-[1rem]" />
          </button>
          <button
            type="button"
            ref={(element) => {
              setActivatorNodeRef(element);
              handleRef(element);
            }}
            {...listeners}
            onKeyDown={onHandleKey}
            aria-label={`Move ${name}`}
            aria-describedby={hintId}
            data-base-ui-swipe-ignore=""
            className="-ml-1 grid h-11 w-8 flex-none cursor-grab touch-none place-items-center text-ink-3 active:cursor-grabbing"
          >
            <DotsSixVerticalIcon weight="bold" aria-hidden className="text-[1.125rem]" />
          </button>
        </div>
      </div>
    </motion.li>
  );
}

/**
 * The emoji of an Option: a small field for the emoji keyboard. It keeps one emoji; letters are
 * ignored. Empty, it shows a quiet smiley.
 */
function EmojiSlot({
  emoji,
  label,
  onEmoji,
  onBlur,
}: {
  emoji: string | undefined;
  label: string;
  onEmoji: (emoji: string | undefined) => void;
  onBlur: (() => void) | undefined;
}) {
  const value = emoji ?? "";
  return (
    <div className="relative size-12 flex-none">
      <input
        value={value}
        onChange={(event) => {
          const text = event.target.value;
          if (text === "") {
            onEmoji(undefined);
            return;
          }
          // The newest emoji wins: the one the person just typed, else any in the text.
          const typed = firstEmoji(text.replace(value, "")) ?? firstEmoji(text);
          if (typed !== undefined) onEmoji(typed);
        }}
        onBlur={onBlur}
        aria-label={`Emoji for ${label}`}
        autoComplete="off"
        enterKeyHint="done"
        className={cn(fieldClass, "size-12 px-0 text-center text-[1.375rem] caret-transparent")}
      />
      {value === "" ? (
        <SmileyIcon
          aria-hidden
          className="pointer-events-none absolute inset-0 m-auto text-[1.25rem] text-ink-3"
        />
      ) : null}
    </div>
  );
}

function RetiredOptions({
  options,
  canRestore,
  onRestore,
  reduceMotion,
}: {
  options: Option[];
  canRestore: boolean;
  onRestore: (id: OptionId) => void;
  reduceMotion: boolean;
}) {
  const labelId = useId();
  return (
    <div className="pt-4">
      <SectionLabel id={labelId}>Retired</SectionLabel>
      <p className="-mt-1 mb-2 text-[0.875rem] leading-5 text-ink-3">
        Past days keep these. New days don't offer them.
      </p>
      <ul role="list" aria-labelledby={labelId} className="flex flex-col">
        <AnimatePresence initial={false}>
          {options.map((option) => (
            <motion.li key={option.id} {...rowPresence(reduceMotion)}>
              <div className="flex h-11 items-center gap-3 px-1">
                <span className="w-6 flex-none text-center text-[1.125rem]" aria-hidden>
                  {option.emoji ?? ""}
                </span>
                <span className="min-w-0 flex-1 truncate text-[1rem] text-ink-3 line-through decoration-ink-4/60">
                  {option.label}
                </span>
                <button
                  type="button"
                  onClick={() => onRestore(option.id)}
                  disabled={!canRestore}
                  aria-label={`Restore ${option.label}`}
                  className="flex h-9 flex-none items-center gap-1.5 squircle-[0.625rem] bg-surface-2 px-3 text-[0.9375rem] font-medium text-ink-2 transition-[color,scale,opacity] duration-150 ease-out hover:text-ink active:scale-[0.96] disabled:opacity-40 disabled:active:scale-100"
                >
                  <ArrowCounterClockwiseIcon weight="bold" aria-hidden />
                  Restore
                </button>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
