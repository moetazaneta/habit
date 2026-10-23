import { useState, useSyncExternalStore } from "react";

import {
  getControls,
  getStored,
  resetAll,
  resolve,
  setValue,
  subscribe,
  type LabControl,
} from "@/components/lab/store";

const OPEN_KEY = "habit:lab-open";

/**
 * The lab panel, mounted by main.tsx in `vp dev` only. It lists the controls of the components on
 * screen and stays hidden while there are none.
 */
export default function LabPanel() {
  const controls = useSyncExternalStore(subscribe, getControls);
  const [open, setOpen] = useState(() => localStorage.getItem(OPEN_KEY) !== "false");
  if (controls.length === 0) return null;

  const toggle = () => {
    localStorage.setItem(OPEN_KEY, String(!open));
    setOpen(!open);
  };

  return (
    <aside
      aria-label="Lab"
      data-open={open ? "" : undefined}
      className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] left-3 z-[70] flex max-h-[70dvh] w-auto flex-col data-open:w-60 overflow-hidden rounded-[0.875rem] bg-surface text-[0.8125rem] leading-4 text-ink shadow-(--elevation) dark:outline dark:outline-line"
    >
      <div className="flex items-center gap-1 px-1.5 py-1">
        <button
          type="button"
          aria-expanded={open}
          className="flex-1 rounded-md px-1.5 py-1 text-left font-semibold hover:bg-surface-2"
          onClick={toggle}
        >
          Lab {open ? "▾" : `▸ ${controls.length}`}
        </button>
        {open ? (
          <button
            type="button"
            className="rounded-md px-1.5 py-1 text-ink-3 hover:bg-surface-2 hover:text-ink"
            onClick={resetAll}
          >
            Reset
          </button>
        ) : null}
      </div>
      {open ? (
        <div className="flex flex-col gap-3 overflow-y-auto px-3 pt-1 pb-3">
          {controls.map((control) => (
            <Control key={control.id} control={control} />
          ))}
        </div>
      ) : null}
    </aside>
  );
}

function Control({ control }: { control: LabControl }) {
  const stored = useSyncExternalStore(subscribe, () => getStored(control.id));
  const value = resolve(control, stored);

  if (control.kind === "flag") {
    return (
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          className="accent-ink"
          checked={value as boolean}
          onChange={(event) => setValue(control.id, event.target.checked)}
        />
        {control.label}
      </label>
    );
  }

  return (
    <fieldset className="flex flex-col gap-0.5">
      <legend className="mb-1 text-xs font-medium text-ink-3">{control.label}</legend>
      {control.options.map((option, index) => (
        <label
          key={option}
          className="-mx-1.5 flex items-center gap-2 rounded-md px-1.5 py-1 has-checked:bg-surface-2"
        >
          <input
            type="radio"
            className="accent-ink"
            name={`lab-${control.id}`}
            checked={value === option}
            onChange={() => setValue(control.id, option)}
          />
          <span className="flex-1">{option}</span>
          <span className="text-ink-4 tabular-nums" aria-hidden>
            {index + 1}
          </span>
        </label>
      ))}
    </fieldset>
  );
}
