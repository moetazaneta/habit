import type { HabitColor, HabitIcon as HabitIconValue } from "@habit/core";
import type { Icon } from "@phosphor-icons/react";
import { lazy, Suspense, type CSSProperties, type LazyExoticComponent } from "react";

import { PHOSPHOR_ICON_LOADERS } from "@/components/habit-icon/catalog";
import { habitColorVar } from "@/components/palette";
import { cn } from "@/lib/utils";

export { PHOSPHOR_ICON_GROUPS } from "@/components/habit-icon/catalog";

export interface HabitIconProps {
  icon: HabitIconValue;
  color: HabitColor;
  /** The side, as a CSS length. Default: `var(--icon)` (22px on a phone). */
  size?: string;
  className?: string;
}

/**
 * The icon of a habit: a Phosphor icon in the duotone weight, drawn in the habit color with no
 * tile behind it (the duotone's 20% layer is its soft tint), or an emoji. A Phosphor icon loads on
 * first use; until then the box keeps its size, so the row does not move, and the icon fades in
 * when it comes.
 */
export function HabitIcon({ icon, color, size, className }: HabitIconProps) {
  const style = {
    "--c": habitColorVar(color),
    ...(size === undefined ? {} : { "--icon-size": size }),
  } as CSSProperties;
  const box = cn(
    "inline-grid size-(--icon-size,var(--icon)) flex-none place-items-center text-habit",
    className,
  );

  if (icon.type === "emoji") {
    return (
      <span className={box} style={style} aria-hidden>
        <span className="text-[calc(var(--icon-size,var(--icon))*0.9)] leading-none">
          {icon.emoji}
        </span>
      </span>
    );
  }

  const PhosphorIcon = phosphorIcon(icon.name);
  // An icon that was not loaded at this render comes later than its row: it fades in.
  const late = !loadedIcons.has(iconKey(icon.name));
  return (
    <span className={box} style={style} aria-hidden>
      <Suspense fallback={null}>
        <PhosphorIcon
          weight="duotone"
          size="100%"
          className={late ? "habit-icon-late" : undefined}
        />
      </Suspense>
    </span>
  );
}

const lazyIcons = new Map<string, LazyExoticComponent<Icon>>();
/** The icons that have rendered once, so they render at once from now on. */
const loadedIcons = new Set<string>();

function iconKey(name: string): string {
  return name in PHOSPHOR_ICON_LOADERS ? name : "circle";
}

function phosphorIcon(name: string): LazyExoticComponent<Icon> {
  const key = iconKey(name);
  let component = lazyIcons.get(key);
  if (component === undefined) {
    const load = PHOSPHOR_ICON_LOADERS[key]!;
    component = lazy(() =>
      load().then((Loaded) => {
        loadedIcons.add(key);
        return { default: Loaded };
      }),
    );
    lazyIcons.set(key, component);
  }
  return component;
}

/** Starts loading the icons of these habits, so the list paints them without a gap. */
export function preloadHabitIcons(icons: readonly HabitIconValue[]): void {
  for (const icon of icons) {
    if (icon.type === "phosphor") void PHOSPHOR_ICON_LOADERS[icon.name]?.();
  }
}
