import { useEffect, useSyncExternalStore, type ComponentType } from "react";

import { getStored, register, resolve, subscribe, type LabControl } from "@/components/lab/store";

/**
 * The lab: a dev-only way to try UI ideas in the running app. A component declares a choice or a
 * flag, the lab panel (bottom left in `vp dev`) switches it live, and the pick survives a reload.
 * A production build has no panel and always gets the first option or the initial value.
 *
 * When an idea is decided, replace the lab call with the winner and delete the other options.
 * See docs/lab.md.
 */

interface VariantOptions<O extends readonly [string, ...string[]]> {
  /** The name of the control in the panel. */
  label: string;
  options: O;
  /** The option before any pick; the first one by default. */
  initial?: O[number];
}

/** The picked option of a choice, for a variant that needs more than one place in the tree. */
export function useVariant<const O extends readonly [string, ...string[]]>(
  id: string,
  { label, options, initial = options[0] }: VariantOptions<O>,
): O[number] {
  return useLabControl({ kind: "choice", id, label, options, initial }) as O[number];
}

/** A switch in the panel, for a detail to turn on and off. */
export function useLabFlag(
  id: string,
  { label, initial = false }: { label: string; initial?: boolean },
) {
  return useLabControl({ kind: "flag", id, label, initial });
}

interface VariantsProps<P extends object> {
  id: string;
  label: string;
  /** The candidates, by the name the panel shows. They all get the same props. */
  options: Record<string, ComponentType<P>>;
  props: P;
}

/** Renders one of several components in the same place, the one picked in the panel. */
export function Variants<P extends object>({ id, label, options, props }: VariantsProps<P>) {
  const names = Object.keys(options) as [string, ...string[]];
  const picked = useVariant(id, { label, options: names });
  const Picked = options[picked]!;
  return <Picked {...props} />;
}

function useLabControl<C extends LabControl>(control: C): C["initial"] {
  const stored = useSyncExternalStore(subscribe, () => getStored(control.id));
  // The control is a new object on each render; its content is what decides a new registration.
  const declared = JSON.stringify(control);
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    return register(JSON.parse(declared) as LabControl);
  }, [declared]);
  return import.meta.env.DEV ? resolve(control, stored) : control.initial;
}
