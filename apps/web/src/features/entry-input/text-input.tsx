import type { Day, EntryValue, Habit } from "@habit/core";
import { useEffect, useEffectEvent, useState, type RefObject } from "react";

import { useAct } from "@/components/act";

type TextHabit = Extract<Habit, { kind: "text" }>;

/** The text applies after this pause, and at once when the field loses focus. */
const TYPING_PAUSE_MS = 700;

/** The note of a text Day. It applies as the person types; an empty note clears the Day. */
export function TextInput({
  habit,
  day,
  value,
  fieldRef,
}: {
  habit: TextHabit;
  day: Day;
  value: EntryValue | undefined;
  fieldRef: RefObject<HTMLElement | null>;
}) {
  const act = useAct();
  const current = value?.kind === "text" ? value.text : "";
  const [draft, setDraft] = useState(current);
  const [editing, setEditing] = useState(false);
  if (!editing && draft !== current) setDraft(current);

  const commit = (text: string) => {
    if (text === current) return;
    if (text.trim() === "") {
      if (value !== undefined) act({ type: "clearEntry", habitId: habit.id, day });
      return;
    }
    act({ type: "setEntry", habitId: habit.id, day, value: { kind: "text", text } });
  };

  const commitTyped = useEffectEvent(() => commit(draft));
  useEffect(() => {
    if (!editing) return;
    const timer = window.setTimeout(commitTyped, TYPING_PAUSE_MS);
    return () => window.clearTimeout(timer);
  }, [draft, editing]);

  return (
    <div className="flex flex-col gap-3">
      <textarea
        ref={fieldRef as RefObject<HTMLTextAreaElement | null>}
        className="entry-text-field"
        rows={3}
        placeholder="A note for this day"
        aria-label={`${habit.name}, note`}
        value={draft}
        onFocus={() => setEditing(true)}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => {
          setEditing(false);
          commit(draft);
        }}
      />
      <button
        type="button"
        className="sheet-button"
        disabled={value === undefined && draft === ""}
        onClick={() => {
          setDraft("");
          if (value !== undefined) act({ type: "clearEntry", habitId: habit.id, day });
        }}
      >
        Clear
      </button>
    </div>
  );
}
