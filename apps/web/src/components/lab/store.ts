/**
 * The state of the lab: the controls that the mounted components declare, and the values that the
 * panel picked for them. Values persist in localStorage, so a reload keeps the variant on screen.
 */

export type LabControl =
  | { kind: "choice"; id: string; label: string; options: readonly string[]; initial: string }
  | { kind: "flag"; id: string; label: string; initial: boolean };

export type LabValue = string | boolean;

const STORAGE_KEY = "habit:lab";

const mounted = new Map<string, { control: LabControl; count: number }>();
let controls: LabControl[] = [];
let values: Record<string, LabValue> = import.meta.env.DEV ? load() : {};
const listeners = new Set<() => void>();

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The controls of the components on screen, in the order they mounted. */
export function getControls(): LabControl[] {
  return controls;
}

/** What the panel picked for `id`, if anything; `resolve` checks it against the control. */
export function getStored(id: string): LabValue | undefined {
  return values[id];
}

/** The stored value when the control still accepts it, else the control's initial value. */
export function resolve<C extends LabControl>(
  control: C,
  stored: LabValue | undefined,
): C["initial"] {
  if (control.kind === "flag") return typeof stored === "boolean" ? stored : control.initial;
  return typeof stored === "string" && control.options.includes(stored) ? stored : control.initial;
}

export function setValue(id: string, value: LabValue) {
  values = { ...values, [id]: value };
  save();
  emit();
}

/** Back to the initial value of every control, mounted or not. */
export function resetAll() {
  values = {};
  save();
  emit();
}

/**
 * Declares a control while a component that reads it is mounted. Two components may share an id;
 * the control stays in the panel until the last of them unmounts.
 */
export function register(control: LabControl): () => void {
  const entry = mounted.get(control.id);
  mounted.set(control.id, { control, count: (entry?.count ?? 0) + 1 });
  syncControls();
  return () => {
    const current = mounted.get(control.id);
    if (current === undefined) return;
    if (current.count > 1) mounted.set(control.id, { ...current, count: current.count - 1 });
    else mounted.delete(control.id);
    syncControls();
  };
}

function syncControls() {
  controls = [...mounted.values()].map((entry) => entry.control);
  emit();
}

function emit() {
  for (const listener of listeners) listener();
}

function load(): Record<string, LabValue> {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    return typeof parsed === "object" && parsed !== null
      ? (parsed as Record<string, LabValue>)
      : {};
  } catch {
    return {};
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  } catch {
    // Private mode or a full quota: the pick lasts until the reload.
  }
}
