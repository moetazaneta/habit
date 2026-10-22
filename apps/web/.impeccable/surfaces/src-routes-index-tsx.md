---
version: 1
slug: "src-routes-index-tsx"
primary_target: "src/routes/index.tsx"
related_targets: []
---

# Habit list

Scope: the habit list, the main screen (route `/`). Visitor mode: Operate. Phone first (5 Days), desktop the same in a 600px column (7 Days, base font 20px). Dark and light themes, by the system setting.

Audience and task: the owner, a few times each day, on a phone. Sees the last Days of 10 to 20 habits and records today with one tap or one drag. Nothing judges: no streaks, no percentages, no badges.

## Direction contract

THESIS: Each Day is a gauge that fills from the bottom, on a ground with no surfaces; color appears only where it is data. It refuses the category default: a card per habit with a heatmap and a check button.

OWN-WORLD: Dark theme: pure black ground #000, no cards, no panels, no lines; space separates rows. Light theme: the same structure on white. Habit hue appears only in the Phosphor duotone icon and in the Day gauges: a muted 16-color palette. Names in IBM Plex Sans, semibold, slightly dimmed (#b9b9be on black). Squircle corners: corner-shape superellipse(2) with a radius fallback. Empty Day = frame only; partial = fill from the bottom inside a frame in the habit color at 35%; full = solid.

STORY: The owner opens the app, reads the last Days at a glance, taps today's squares or drags across Days, gets an Undo toast after a paint, and leaves. A new habit starts from the ghost row at the end of the list.

FIRST VIEWPORT: Status bar, then the sticky day header (weekday letter over the date number; today white bold, others muted) aligned over the gauge columns at the right; no title. Rows about 54px: colored duotone icon 22px, name 17px, five 30px gauges with 6px gaps. Last row: the ghost "New habit" (dashed squircle icon with a plus, muted text, five dashed empty gauges). When needed, an Undo toast capsule (#1c1c1e, no shadow) at the bottom.

FORM: Grounded safer direction "Quiet standard, dark", the first of three safer candidates in re-roll round 2, refined in round 3 as variation B, "icons in the habit color". Sketch: .impeccable/mocks/decision/r3-color-icons.html. seed:bf31d7351e3e2498

Signature move: the gauge fill rises with a short spring overshoot (the square reaches about 1.04 and settles), the same motion grammar in the habit page and the sheets.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Open

- The light theme counterpart: the same structure on white; the palette needs a light-theme mapping that keeps the intensity steps clear.
