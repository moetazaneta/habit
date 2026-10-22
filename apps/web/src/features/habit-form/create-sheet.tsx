import {
  createHabit,
  lastOrder,
  validateHabitDraft,
  type HabitIcon as HabitIconValue,
  type OptionId,
} from "@habit/core";
import { useHabits, useHabitState } from "@habit/data";
import { CaretLeftIcon } from "@phosphor-icons/react/dist/csr/CaretLeft";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";

import { useAct } from "@/components/act";
import { haptic } from "@/components/haptics";
import { ResponsiveSheet } from "@/components/sheet";
import { useIsWide } from "@/components/use-media-query";

import { ColorSwatches, SheetButton, StickyFooter } from "./controls";
import {
  addOption,
  DEFAULT_ICON,
  draftOf,
  issueMessages,
  moveOffered,
  newForm,
  nextColor,
  removeOption,
  restoreOption,
  savedOptions,
  updateOption,
  withKind,
  type FormState,
} from "./draft";
import {
  DirectionField,
  IconTile,
  KIND_LABELS,
  KindField,
  NameFields,
  NumberFields,
} from "./fields";
import { IconPicker } from "./icon-picker";
import { suggestIcon } from "./icon-search";
import { OptionsEditor } from "./options-editor";
import { FADE_IN } from "./presence";
import { Steps } from "./steps";

type Step = "basics" | "details" | "icon";

const NO_STORED_OPTIONS: ReadonlySet<OptionId> = new Set();

/**
 * The create sheet (`?new=true`). Two steps, as in Family: first who the habit is (icon, name,
 * color, Kind and Direction), then, for a number, a choice or a scale, the fields of its Kind. A
 * check or a text habit is added from the first step. The icon picker is a step of its own, and
 * comes back to the first. "Add habit" creates the habit after the last one and closes the sheet.
 */
export function CreateHabitSheet({
  open,
  onClose,
  onExitComplete,
}: {
  open: boolean;
  onClose: () => void;
  onExitComplete: () => void;
}) {
  const { habits } = useHabits();
  const state = useHabitState();
  const act = useAct();
  const wide = useIsWide();
  const [firstRun] = useState(() => habits.length === 0);
  const [form, setForm] = useState<FormState>(() => newForm(nextColor(habits)));
  const [iconPicked, setIconPicked] = useState(false);
  // The tile's tint rises once, when the sheet opens, not each time the first step comes back.
  const [leftFirstStep, setLeftFirstStep] = useState(false);
  const [step, setStep] = useState<Step>("basics");
  const [direction, setDirection] = useState<1 | -1>(1);
  const [attempted, setAttempted] = useState({ basics: false, details: false });
  const [touched, setTouched] = useState({ target: false, step: false });
  const nameRef = useRef<HTMLInputElement>(null);

  const draft = draftOf({ ...form, options: savedOptions(form.options, NO_STORED_OPTIONS) });
  const issues = validateHabitDraft(draft);
  const messages = issueMessages(issues, form);
  const nameIssue = issues.find((issue) => issue.field === "name");
  const hasDetails = form.kind === "number" || form.kind === "choice" || form.kind === "scale";

  const go = (next: Step, by: 1 | -1) => {
    setLeftFirstStep(true);
    setDirection(by);
    setStep(next);
  };

  const create = () => {
    if (issues.length > 0) {
      setAttempted({ basics: true, details: true });
      setTouched({ target: true, step: true });
      if (nameIssue !== undefined) {
        if (step !== "basics") go("basics", -1);
        else nameRef.current?.focus();
      }
      return;
    }
    const habit = createHabit(draft, { now: Date.now(), lastOrder: lastOrder(state) });
    act({ type: "createHabit", habit });
    haptic();
    onClose();
  };

  const next = () => {
    if (nameIssue !== undefined) {
      setAttempted((current) => ({ ...current, basics: true }));
      nameRef.current?.focus();
      return;
    }
    if (hasDetails) go("details", 1);
    else create();
  };

  const onName = (name: string) =>
    setForm((current) => ({
      ...current,
      name,
      icon: iconPicked ? current.icon : (suggestIcon(name) ?? DEFAULT_ICON),
    }));

  const onPick = (icon: HabitIconValue) => {
    setForm((current) => ({ ...current, icon }));
    setIconPicked(true);
    go("basics", -1);
  };

  const title = step === "icon" ? "Icon" : firstRun ? "Your first habit" : "New habit";

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      onExitComplete={onExitComplete}
      title={title}
      className="sm:w-[min(25rem,100%)]"
      {...(wide ? { initialFocus: nameRef } : {})}
    >
      <Steps step={step} direction={direction}>
        {step === "basics" ? (
          <div className="flex flex-col gap-5">
            <div className="flex justify-center pt-1">
              <IconTile
                icon={form.icon}
                color={form.color}
                onClick={() => go("icon", 1)}
                fillOnMount={!leftFirstStep}
              />
            </div>
            <NameFields
              name={form.name}
              description={form.description}
              onName={onName}
              onDescription={(description) => setForm((current) => ({ ...current, description }))}
              onEnter={next}
              message={
                attempted.basics || nameIssue?.code === "tooLong" ? messages.name : undefined
              }
              nameRef={nameRef}
            />
            <ColorSwatches
              value={form.color}
              onChange={(color) => setForm((current) => ({ ...current, color }))}
            />
            <KindField
              value={form.kind}
              onChange={(kind) => setForm((current) => withKind(current, kind))}
            />
            <DirectionField
              value={form.direction}
              onChange={(value) => setForm((current) => ({ ...current, direction: value }))}
            />
            <StickyFooter>
              <SheetButton
                onClick={next}
                className="w-full"
                // The old label lingers while it fades out; the name is the new one.
                aria-label={hasDetails ? "Next" : "Add habit"}
              >
                <ButtonLabel label={hasDetails ? "Next" : "Add habit"} />
              </SheetButton>
            </StickyFooter>
          </div>
        ) : step === "details" ? (
          <div className="flex flex-col gap-5">
            <button
              type="button"
              onClick={() => go("basics", -1)}
              className="-mx-1 flex min-h-12 items-center gap-3 squircle-[0.875rem] px-1 text-left transition-[background-color,scale] duration-150 ease-out hover:bg-surface-2 active:scale-[0.98]"
              aria-label={`Back to ${form.name.trim() || "the name"}`}
            >
              <IconTile icon={form.icon} color={form.color} size="small" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[1.0625rem] font-semibold text-ink">
                  {form.name.trim()}
                </span>
                <span className="block text-[0.875rem] leading-5 text-ink-3">
                  {KIND_LABELS[form.kind]} · {form.direction === "quit" ? "Quit" : "Build"}
                </span>
              </span>
            </button>
            {form.kind === "number" ? (
              <NumberFields
                form={form}
                onChange={(patch) => setForm((current) => ({ ...current, ...patch }))}
                onBlur={(field) => {
                  if (field !== "unit") setTouched((current) => ({ ...current, [field]: true }));
                }}
                messages={{
                  target: touched.target || attempted.details ? messages.target : undefined,
                  step: touched.step || attempted.details ? messages.step : undefined,
                }}
              />
            ) : form.kind === "choice" || form.kind === "scale" ? (
              <OptionsEditor
                kind={form.kind}
                color={form.color}
                options={form.options}
                onLabel={(id, label) =>
                  setForm((current) => ({
                    ...current,
                    options: updateOption(current.options, id, { label }),
                  }))
                }
                onEmoji={(id, emoji) =>
                  setForm((current) => ({
                    ...current,
                    options: updateOption(current.options, id, { emoji }),
                  }))
                }
                onAdd={() => {
                  const options = addOption(form.options);
                  setForm((current) => ({ ...current, options }));
                  return options[options.length - 1]!.id;
                }}
                onRemove={(id) =>
                  setForm((current) => ({
                    ...current,
                    options: removeOption(current.options, id, { used: false, now: Date.now() }),
                  }))
                }
                onRestore={(id) =>
                  setForm((current) => ({
                    ...current,
                    options: restoreOption(current.options, id),
                  }))
                }
                onMove={(from, to) =>
                  setForm((current) => ({
                    ...current,
                    options: moveOffered(current.options, from, to),
                  }))
                }
                message={attempted.details ? messages.options : undefined}
              />
            ) : null}
            <StickyFooter>
              <div className="flex gap-2">
                <SheetButton
                  variant="quiet"
                  onClick={() => go("basics", -1)}
                  aria-label="Back"
                  className="w-12 flex-none px-0"
                >
                  <CaretLeftIcon weight="bold" aria-hidden />
                </SheetButton>
                <SheetButton onClick={create} className="flex-1">
                  Add habit
                </SheetButton>
              </div>
            </StickyFooter>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <IconPicker value={form.icon} color={form.color} onPick={onPick} autoFocus={wide} />
            <StickyFooter>
              <SheetButton variant="quiet" onClick={() => go("basics", -1)} className="w-full">
                Back
              </SheetButton>
            </StickyFooter>
          </div>
        )}
      </Steps>
    </ResponsiveSheet>
  );
}

/** The label of the primary button: a new label crossfades in place of the old one. */
function ButtonLabel({ label }: { label: string }) {
  const reduceMotion = useReducedMotion() === true;
  return (
    <span className="relative grid">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={label}
          initial={
            reduceMotion
              ? { opacity: 0 }
              : { opacity: 0, transform: "translateY(0.375rem)", filter: "blur(2px)" }
          }
          animate={{ opacity: 1, transform: "translateY(0rem)", filter: "blur(0px)" }}
          exit={
            reduceMotion
              ? { opacity: 0 }
              : { opacity: 0, transform: "translateY(-0.375rem)", filter: "blur(2px)" }
          }
          transition={FADE_IN}
        >
          {label}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
