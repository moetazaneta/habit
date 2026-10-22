---
name: Habit
description: A habit tracker on a bare ground, where each Day is a gauge that fills from the bottom and color appears only as data.
colors:
  # Neutrals, light theme (the default in CSS)
  ground: "oklch(1 0 0)"
  ink: "oklch(0.232 0.004 286)"
  ink-2: "oklch(0.403 0.008 286)"
  ink-3: "oklch(0.54 0.008 286)"
  ink-4: "oklch(0.557 0.008 286)"
  line: "oklch(0.896 0.005 286)"
  line-strong: "oklch(0.831 0.007 286)"
  surface: "oklch(1 0 0)"
  surface-2: "oklch(0.962 0.003 286)"
  surface-3: "oklch(0.935 0.005 286)"
  field: "oklch(0.962 0.003 286)"
  backdrop: "oklch(0 0 0 / 0.2)"
  toast: "oklch(0.232 0.004 286)"
  toast-ink: "oklch(0.963 0.007 286)"
  # Neutrals, dark theme (prefers-color-scheme: dark)
  ground-dark: "oklch(0 0 0)"
  ink-dark: "oklch(0.963 0.007 286)"
  ink-2-dark: "oklch(0.787 0.007 286)"
  ink-3-dark: "oklch(0.648 0.007 286)"
  ink-4-dark: "oklch(0.588 0.006 286)"
  line-dark: "oklch(0.294 0.004 286)"
  line-strong-dark: "oklch(0.349 0.003 286)"
  surface-dark: "oklch(0.227 0.004 286)"
  surface-2-dark: "oklch(0.294 0.004 286)"
  surface-3-dark: "oklch(0.349 0.003 286)"
  field-dark: "oklch(0 0 0)"
  backdrop-dark: "oklch(0 0 0 / 0.6)"
  toast-dark: "oklch(0.227 0.004 286)"
  toast-ink-dark: "oklch(0.963 0.007 286)"
  # The habit palette, light theme
  habit-rose: "oklch(0.654 0.09 19.4)"
  habit-apricot: "oklch(0.649 0.086 59.9)"
  habit-ochre: "oklch(0.647 0.092 78)"
  habit-sand: "oklch(0.645 0.062 79)"
  habit-mustard: "oklch(0.643 0.095 100.4)"
  habit-olive: "oklch(0.638 0.096 125.9)"
  habit-green: "oklch(0.635 0.076 151.4)"
  habit-jade: "oklch(0.636 0.073 172.7)"
  habit-teal: "oklch(0.635 0.068 192)"
  habit-sky: "oklch(0.637 0.084 223.9)"
  habit-blue: "oklch(0.645 0.098 254.1)"
  habit-slate: "oklch(0.644 0.04 264.3)"
  habit-violet: "oklch(0.654 0.101 299.4)"
  habit-mauve: "oklch(0.653 0.065 336.3)"
  habit-raspberry: "oklch(0.657 0.094 358.2)"
  habit-stone: "oklch(0.643 0.012 67.6)"
  # The habit palette, dark theme
  habit-rose-dark: "oklch(0.704 0.086 19.4)"
  habit-apricot-dark: "oklch(0.753 0.082 59.9)"
  habit-ochre-dark: "oklch(0.739 0.087 78)"
  habit-sand-dark: "oklch(0.717 0.059 79)"
  habit-mustard-dark: "oklch(0.751 0.091 100.4)"
  habit-olive-dark: "oklch(0.748 0.091 125.9)"
  habit-green-dark: "oklch(0.707 0.073 151.4)"
  habit-jade-dark: "oklch(0.72 0.069 172.7)"
  habit-teal-dark: "oklch(0.739 0.065 192)"
  habit-sky-dark: "oklch(0.721 0.08 223.9)"
  habit-blue-dark: "oklch(0.679 0.094 254.1)"
  habit-slate-dark: "oklch(0.688 0.038 264.3)"
  habit-violet-dark: "oklch(0.694 0.096 299.4)"
  habit-mauve-dark: "oklch(0.735 0.061 336.3)"
  habit-raspberry-dark: "oklch(0.681 0.09 358.2)"
  habit-stone-dark: "oklch(0.699 0.011 67.6)"
typography:
  display:
    fontFamily: "IBM Plex Sans Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: "2.75rem"
    letterSpacing: "-0.02em"
    fontFeature: "tnum"
  title:
    fontFamily: "IBM Plex Sans Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 600
    lineHeight: "1.375rem"
    letterSpacing: "-0.01em"
  body:
    fontFamily: "IBM Plex Sans Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: "1.25rem"
  control:
    fontFamily: "IBM Plex Sans Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    letterSpacing: "-0.01em"
  description:
    fontFamily: "IBM Plex Sans Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.25rem"
  caption:
    fontFamily: "IBM Plex Sans Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: "1rem"
  label:
    fontFamily: "IBM Plex Sans Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: "0.9375rem"
rounded:
  gauge: "19%"
  icon: "18%"
  control: "0.625rem"
  row: "0.75rem"
  stepper: "0.875rem"
  popover: "0.875rem"
  dialog: "1rem"
  sheet: "1.25rem"
  pill: "9999px"
spacing:
  gutter: "1.25rem"
  gutter-narrow: "1rem"
  row: "3.375rem"
  icon: "1.375rem"
  square: "1.875rem"
  square-narrow: "1.75rem"
  square-gap: "0.375rem"
  square-gap-narrow: "0.3125rem"
  gap: "0.75rem"
  gap-tight: "0.5rem"
  touch: "2.75rem"
components:
  day-square:
    size: "{spacing.square}"
    rounded: "{rounded.gauge}"
  habit-icon:
    size: "{spacing.icon}"
  habit-row:
    height: "{spacing.row}"
    padding: "0 1.25rem"
  habit-name:
    textColor: "{colors.ink-2}"
    typography: "{typography.title}"
  habit-name-hover:
    textColor: "{colors.ink}"
  habit-row-lifted:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.row}"
  ghost-row-name:
    textColor: "{colors.ink-4}"
  ghost-row-name-hover:
    textColor: "{colors.ink-2}"
  day-header:
    textColor: "{colors.ink-3}"
    typography: "{typography.label}"
  day-header-today:
    textColor: "{colors.ink}"
  sheet:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sheet}"
    width: "30rem"
  dialog:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.dialog}"
    width: "22rem"
  popover:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.popover}"
    width: "17rem"
  sheet-title:
    textColor: "{colors.ink}"
    typography: "{typography.title}"
  sheet-description:
    textColor: "{colors.ink-3}"
    typography: "{typography.description}"
  sheet-close:
    textColor: "{colors.ink-3}"
    size: "{spacing.touch}"
    rounded: "{rounded.pill}"
  sheet-close-hover:
    textColor: "{colors.ink}"
  button:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    height: "{spacing.touch}"
    padding: "0 1rem"
  button-hover:
    backgroundColor: "{colors.surface-3}"
  button-active:
    backgroundColor: "{colors.surface-3}"
  button-disabled:
    textColor: "{colors.ink-4}"
  stepper:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.stepper}"
    size: "3.5rem"
  stepper-active:
    backgroundColor: "{colors.surface-3}"
  number-field:
    textColor: "{colors.ink}"
    typography: "{typography.display}"
  text-field:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0.75rem 0.875rem"
  option:
    textColor: "{colors.ink-2}"
    rounded: "{rounded.control}"
    padding: "0.5rem 0.75rem"
    height: "2.875rem"
  option-checked:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
  toast:
    backgroundColor: "{colors.toast}"
    textColor: "{colors.toast-ink}"
    rounded: "{rounded.pill}"
    height: "2.875rem"
    padding: "0 0.5rem 0 1.375rem"
  toast-action:
    textColor: "{colors.toast-ink}"
    typography: "{typography.control}"
    rounded: "{rounded.pill}"
    height: "2.25rem"
    padding: "0 0.875rem"
---

# Design System: Habit

## Overview

**Creative North Star: "Quiet Standard"**

The app is a bare ground with only data on it. In the light theme the ground is white. In the dark theme it is pure black. There are no cards, no panels and no dividers: space separates the rows. The only hue on the screen is the habit's own color, in its icon and in its Day gauges.

Each Day is a gauge: a squircle that fills from the bottom. An empty Day is a frame. A full Day is solid. This one shape carries the product, in the list, on the habit page and inside the inputs. The type is one family, IBM Plex Sans, in a small set of sizes. Hierarchy comes from weight and from four steps of ink.

The care goes into motion and touch, not into decoration. A value that rises springs up, and the square pulses to about 1.04. A value that falls drains without a bounce. On a phone, forms open as bottom sheets. On a desktop, they open as dialogs and popovers. The theme follows the system setting, and there is no switch. The desktop is the phone layout in a 600px column with a 20px base.

**Key Characteristics:**
- A bare ground: white or pure black, with no surfaces at rest.
- Color only where it is data: the habit icon and the Day gauges.
- The Day gauge (DaySquare) is the one signature shape.
- Squircle corners everywhere, with a plain radius as the fallback.
- One typeface, IBM Plex Sans, in sizes from 12px to 17px plus one large number size.
- Springs that settle quickly, a short overshoot when a value rises, and fades under reduced motion.

## Colors

Grey ink with a faint violet cast (hue 286) on white or black, plus sixteen muted habit hues that appear only as data.

Every color is OKLCH. The light theme is the default in CSS. The dark theme replaces the same custom properties inside `@media (prefers-color-scheme: dark)`, so a `-dark` token in the frontmatter is the dark value of the token with the same name. Tailwind gets the neutrals as colors (`bg-ground`, `text-ink-3`, `bg-surface-2` and so on); `dark:` is the media query, not a class.

### Primary

- **The habit palette** (`habit-rose` to `habit-stone`, 16 hues): the color of each habit, chosen from a fixed set. The hues are rose, apricot, ochre, sand, mustard, olive, green, jade, teal, sky, blue, slate, violet, mauve, raspberry and stone. The dark values are the owner's muted palette. The light values keep the same hue and chroma at a lightness of about 0.64, so a full square has 3.3:1 against white and the intensity steps stay clear. An element puts a habit's color in scope as `--c` (`habitColorStyle(color)`); then the gauge, the icon, and Tailwind's `text-habit`, `bg-habit` and `border-habit` read it.
- **Frame mix** (`--frame-mix`: 40% light, 35% dark): how much of the habit color the frame of a partial or zero Day takes, mixed with transparent. The light theme needs more, because a 35% frame is too faint on white.

### Neutral

- **Pure Ground** (`ground`): the page, the sticky day header behind its dates, and the text on a full square. White in the light theme, pure black in the dark theme.
- **Ink** (`ink`): primary text, sheet titles, today in the day header, a habit name under the pointer, the caret, and the light theme's toast capsule.
- **Dimmed Ink** (`ink-2`): habit names at rest and option labels at rest. Slightly dimmed, so the gauges lead.
- **Quiet Ink** (`ink-3`): the day header, sheet descriptions, captions, placeholders, the close icon, and the focus ring.
- **Faint Ink** (`ink-4`): the ghost row, disabled controls, and the focus ring of a text field. All four inks meet WCAG AA on the ground.
- **Line** (`line`): the frame of an empty Day, the dashed ghost gauge, and the frame of a future Day. Never a divider.
- **Strong Line** (`line-strong`): an empty frame under the pointer, the dashed ghost icon, the sheet handle, and the scrollbar thumb.
- **Surface** (`surface`): sheets, dialogs, popovers, and a row lifted for a reorder. In the light theme it is white like the ground and a shadow lifts it; in the dark theme it is a lighter grey, and the lightness is the elevation.
- **Surface 2** (`surface-2`): the rest fill of a control inside a sheet, a checked option, the close button's disc, and skeleton shapes.
- **Surface 3** (`surface-3`): the hover and press fill of a control inside a sheet.
- **Field** (`field`): a text field inside a sheet. In the light theme it equals `surface-2`. In the dark theme it is a well of pure black, so the placeholder keeps its contrast.
- **Backdrop** (`backdrop`): the scrim under a sheet or a dialog. 20% black in the light theme, 60% in the dark theme.
- **Toast and Toast Ink** (`toast`, `toast-ink`): the toast capsule. The light theme inverts it (an ink capsule with light text), so an Undo is never missed on white. The dark theme uses the surface grey with light text.

shadcn/ui's variables map onto these tokens: `background` is `ground`, `foreground` is `ink`, `card` and `popover` are `surface`, `primary` is `ink` on `ground`, `secondary`, `muted` and `accent` are `surface-2`, `muted-foreground` is `ink-3`, `border` is `line`, `input` is `line-strong`, `ring` is `ink-3`, and `destructive` is `habit-rose`. A shadcn component wears the world without changes.

### Named Rules

**The Data-Only Color Rule.** Habit hue appears only on what belongs to a habit: its icon, its Day gauges, and the ring of the Day under edit. Text, controls, focus rings and overlays use ink and surface tones. The one exception is shadcn's `destructive`, which borrows rose.

**The One Hue, Two Lightnesses Rule.** A habit color keeps its hue and chroma in both themes. Only the lightness moves: darker on white for contrast, the owner's values on black.

**The Four Inks Rule.** Text uses `ink`, `ink-2`, `ink-3` and `ink-4`, from strongest to quietest. Do not add a fifth grey for text.

## Typography

**Display Font:** IBM Plex Sans Variable (with ui-sans-serif, system-ui, sans-serif)
**Body Font:** IBM Plex Sans Variable (the same stack)

**Character:** One sans with a slightly engineered tone. It stays legible at 12px, and its tabular figures keep columns of numbers even.

### Hierarchy

- **Display** (600, 2.25rem, 2.75rem line, -0.02em, tabular figures): the typed value in the number input, centered. It steps down to 1.75rem at 7 characters and to 1.375rem at 10, so a long value never runs under the buttons.
- **Title** (600, 1.0625rem, 1.375rem line, -0.01em): habit names in the list (in `ink-2`) and sheet titles (in `ink`). One line, with an ellipsis.
- **Page title** (600, 1.5rem, 1.875rem line, -0.02em): the name of a habit on its page, in `ink`. It wraps.
- **Body** (400, 1rem, 1.25rem line): the dates in the day header (with tabular figures and -0.01em), option labels (at 500), and text fields (with a 1.375rem line).
- **Control** (600, 0.9375rem, -0.01em): buttons inside sheets and the toast action. The toast message uses the same size at 500.
- **Description** (400, 0.875rem, 1.25rem line): the line under a sheet title, such as "Today" or "Yesterday". In `ink-3`.
- **Caption** (400, 0.8125rem, 1rem line): the target or the unit under the number field. In `ink-3`, up to two lines.
- **Label** (500, 0.75rem, 0.9375rem line): the weekday letter over each date in the day header.

On a phone these are 12, 13, 14, 15, 16, 17, 24 and 36px. The desktop's 20px base scales all of them by 1.25. The stepper buttons use 1.0625rem at 600 with tabular figures. A field never shows text under 16px (`font-size: max(16px, 1rem)`), because iOS zooms into a smaller field and does not zoom back.

### Named Rules

**The One Family Rule.** IBM Plex Sans is the only typeface. Hierarchy comes from weight (400, 500, 600, 700) and from the ink step, not from a second family or a large jump in size.

**The Today Is Bold Rule.** Weight 700 marks today and nothing else.

**The Tabular Numbers Rule.** A number that sits in a column or changes in place (the dates in the header, the stepper, the number field) uses tabular figures.

## Layout

The phone layout is the layout. A desktop gets the same layout with more room.

- **Breakpoints.** Wide is 640px and more (`min-width: 40rem`). Narrow is 359px and less (`max-width: 22.4375rem`).
- **Wide.** The root font size becomes 125% (20px), so every rem in the app scales by 1.25. The list shows 7 Days instead of 5. Forms open as dialogs and popovers instead of bottom sheets. The content sits in a centered column of 600px. The column is in px, so it does not scale.
- **The row.** The icon and the name are at the left; the Days are at the right, with today at the far right. A row is `row` tall (54px on a phone) and has a `gutter` on each side. The name takes the remaining width and truncates.
- **The Day columns.** Each column is a square plus a gap wide, so the gap is part of the touch target. The half gaps at the ends hang outside, so the last square meets the gutter. The day header uses the same columns, so each date sits over its squares.
- **Narrow.** At 320px the gutter is 1rem, the squares are 1.75rem and the gap is 0.3125rem, so a name keeps room next to five Days.
- **The day header** is sticky at the top, on the ground color. Its top padding is the safe-area inset plus 0.375rem on a phone, and plus 1.5rem on a desktop, which has no status bar. There is no visible page title; a hidden `h1` names the page for screen readers.
- **The bottom** of a scrolling page has 6rem plus the safe-area inset of padding, so the toast never covers the last row.
- **Rhythm.** 0.75rem is the common gap: icon to name, between controls in a sheet, inside an option. 0.5rem is the tight gap: between the buttons in a row, and the inset of a floating sheet. 1.25rem is the side padding of a sheet, the same as the gutter.
- **Touch targets** are about 44px (`touch`, 2.75rem), also where the visible mark is smaller. The close button is a 44px target around a 28px disc. A Day cell is a square plus a gap wide and a full row tall.
- **Safe areas.** The page uses `viewport-fit=cover`. The day header, the bottom sheet, the toast and the bottom padding add `env(safe-area-inset-*)`.
- **Units.** Measures are in rem, so the desktop base scales them. The list's measures are custom properties (`--gutter`, `--row`, `--icon`, `--square`, `--square-gap`).

## Elevation & Depth

Flat by default. Nothing on the ground is raised at rest. Depth appears only for overlays (a sheet, a dialog, a popover) and for a row lifted for a reorder. The two themes do this differently. In the light theme a soft two-layer shadow lifts a white surface off the white ground. In the dark theme a lighter grey surface is the elevation, with a hairline ring of 4% white, because a shadow does not show on black. A scrim (`backdrop`) dims the page under a sheet or a dialog. The toast has no shadow in either theme; its contrast with the ground is enough.

### Shadow Vocabulary

- **Elevation, light** (`box-shadow: 0 0.5rem 2rem oklch(0 0 0 / 0.12), 0 0.0625rem 0.25rem oklch(0 0 0 / 0.06)`): sheets, dialogs, popovers and the lifted row. Use it through `var(--elevation)`.
- **Elevation, dark** (`box-shadow: 0 0 0 0.0625rem oklch(1 0 0 / 0.04)`): the same places in the dark theme, through the same `var(--elevation)`.
- **Gauge frame** (`box-shadow: inset 0 0 0 0.09375rem <frame color>`): not depth. The frame of a Day is an inset ring, so it never changes the size of the square.

Stacking: the scrim is at z-index 50, the Day under edit at 51, and the sheet at 52. The Day under edit stays bright above the scrim while its input is open.

### Named Rules

**The Flat Ground Rule.** Nothing that sits on the ground has a drop shadow. A shadow means "this is above the page": an overlay, or a row in the hand.

**The Lighter Is Higher Rule.** In the dark theme, elevation is a lighter surface, not a shadow.

## Shapes

Squircles. Every rounded corner uses `corner-shape: squircle` with a plain `border-radius` as the fallback. A superellipse looks tighter than a circle arc of the same radius, so where the browser supports `corner-shape`, the radius grows by 1.75. Two tools do this: the `squircle-*` Tailwind utility (its value is the fallback radius), and `calc(<radius> * var(--squircle-k))` in component CSS, where `--squircle-k` is 1 or 1.75.

Pills (the toast and its action) use an infinite radius with `corner-shape: superellipse(1.5)` (the `squircle-full` utility). Small round parts (the close disc, the sheet handle, the skeleton name bar) use a plain 999px radius.

The radius scale, as fallback values: the gauge is 19% of its side, an icon tile 18% of its side, a control 0.625rem, a lifted row 0.75rem, a stepper and a popover 0.875rem, a dialog 1rem, a bottom sheet 1.25rem. Larger containers get larger radii.

There are no structural borders. A frame is an inset ring: 1.5px (0.09375rem) by default, thinner for small gauges through `--ds-frame` (the habit page's year grid uses 0.0625rem). A dashed 1px border marks something that does not exist yet: the ghost gauge (in `line`) and the ghost icon (in `line-strong`).

### Named Rules

**The Squircle Rule.** No rounded corner without `corner-shape: squircle` and the 1.75 multiplier where it is supported. A hard-coded radius alone looks too tight in a browser that draws superellipses.

**The Dashed Means Not Yet Rule.** A dashed outline means "this does not exist yet", as in the ghost "New habit" row. Nothing else is dashed.

## Components

Components are quiet at rest and precise in motion. Controls inside sheets are neutral tonal fills; nothing is filled with an accent color.

### Day gauge (DaySquare)

The signature component: the gauge of one Day, used for every Day on every screen. Import `DaySquare` from `@/components/day-square`. It is only the picture; wrap it in your own button.

- **Shape:** a square of `--ds-size` (default `square`, 30px on a phone), with a squircle radius of 19% of the side. `overflow: hidden` clips the fill to the corners.
- **Frame:** an inset ring of 1.5px in the habit color at `--frame-mix`.
- **Fill:** a layer of solid `--c` that scales up from the bottom to the intensity (0 to 1, `scaleY`).
- **Label (optional):** centered, at 50% of the side, in the habit color; in the ground color on a full square.

| State | When | Look |
| --- | --- | --- |
| empty | no Entry | a frame in `line`, no fill; `line-strong` under a fine pointer |
| zero | an Entry of 0 (such as 0 cigarettes) | a frame in the habit color at `--frame-mix`, no fill |
| partial | intensity between 0 and 1 | the habit frame, filled from the bottom to the intensity |
| full | intensity 1 | solid habit color |
| ghost | a habit that does not exist yet | a dashed 1px border in `line`, no frame, no fill |
| future | a Day after today | a frame in `line` at 45% opacity, no fill; the button is disabled |
| editing | the Day that an open input edits | a 2px outline in the habit color, 3px out, above the scrim |

Empty and zero are both "frame only", but they differ: a recorded zero is data and takes the habit color. Empty and filled differ in shape, not only in color. Mark the Day under edit with `data-editing`, and give it `data-entry={entryRef(habitId, day)}` so the desktop popover can anchor to it.

- **Motion, rise:** the fill moves with the fill spring (a CSS transition on `transform` with `--spring-fill`), so a fast series of taps retargets instead of restarting. The square pulses: a physical spring from scale 1 with a start velocity, peaking at about 1.04.
- **Motion, fall:** the fill drains in 200ms with `--ease-out`. No pulse.
- **Reduced motion:** the fill changes in place and fades from 35% to full opacity in 180ms.
- **Large grids:** set `animated={false}`.

### Day cell (the button around a gauge)

- **Size:** a square plus a gap wide and a full row tall, so the touch target is about 44px.
- **Press:** the gauge scales to 0.95 in 120ms. On touch the pressed look waits 60ms, so a scroll that starts on a square does not dip it.
- **Hold:** on a number habit, a held square shrinks to 0.9 over 450ms, linearly, as the progress toward the input. A release returns it in 120ms with `--ease-out`.
- **Focus:** the global 2px `ink-3` outline, inset by 0.25rem.
- **Scroll:** the row of cells allows `pan-y`, so a vertical drag stays a scroll.

### Habit icon

- **Style:** a Phosphor icon in the duotone weight, drawn in the habit color with no tile behind it. The duotone's 20% layer is its soft tint. An emoji is the alternative, at 90% of the box.
- **Size:** `icon` (22px on a phone) in the list; 1.25rem next to a sheet title.
- **Loading:** a Phosphor icon loads on first use; the box keeps its size, so the row does not move.

### Habit row

- **Structure:** the head (icon, then the name 0.75rem after it) at the left, the Day cells at the right. No background, no border, no divider.
- **Name:** Title type in `ink-2`; `ink` under a fine pointer (120ms).
- **Lifted for a reorder:** the row scales to 1.02, takes a `surface` background with a 0.75rem squircle radius and `var(--elevation)`, and the name turns `ink`. The neighbors move aside in 200ms with `--ease-out`. Under reduced motion the lift has no scale and the neighbors move at once.
- **Ghost row ("New habit"):** the last row. A dashed squircle icon tile in `line-strong` with a bold Phosphor plus in `ink-4`, the name in `ink-4`, and five ghost gauges. Under a fine pointer the name and the icon turn `ink-2`. A press scales it to 0.99.
- **Skeleton:** the shape of the list in `surface-2` (an icon tile and a pill for the name) next to empty gauges. It waits 300ms before it shows, then fades in over 240ms, so a fast start never flashes it.

### Day header

- **Style:** the weekday letter (Label type) over the date (Body type, tabular), in `ink-3`, centered over each Day column.
- **Today:** `ink`, both lines at 700.
- **Position:** sticky at the top on the ground color, aligned to the right over the gauges.

### Sheets, dialogs and popovers (ResponsiveSheet)

One component for every form and input: `ResponsiveSheet` from `@/components/sheet`. It is a bottom sheet on a phone, and on a desktop a centered dialog or a popover at an element.

- **Bottom sheet (phone):** `surface`, a 1.25rem squircle radius, at most 30rem wide. It floats 0.5rem above the bottom edge and the home indicator. A handle (2.25rem by 0.3125rem, `line-strong`, pill) sits at the top. A swipe down dismisses it. It enters with the sheet spring on `translateY`, and leaves in 400ms times the swipe strength with `--ease-drawer`. The scrim fades in 400ms with `--ease-drawer` and follows the swipe.
- **Dialog (desktop):** `surface`, a 1rem squircle radius, 22rem wide, centered. It enters and leaves with a fade and a scale from 0.96 in 200ms with `--ease-out`.
- **Popover (desktop):** `surface`, a 0.875rem squircle radius, 17rem wide, 10px below its anchor, 16px from the window edges. It scales from 0.96 at the anchor side with a fade in 180ms.
- **Header:** at least 3.25rem tall. The title (Title type; an entry input puts the habit icon at 1.25rem before it) and an optional description in `ink-3`. The close button is a 44px target around a 28px `surface-2` disc, with a bold Phosphor X in `ink-3` that turns `ink` under a fine pointer and presses to 0.96.
- **Body:** 0.75rem top padding, 1.25rem on the sides and the bottom.
- **Height:** the content morphs its height with the morph spring, so a sheet grows and shrinks between steps instead of jumping.
- **Reduced motion:** a 180ms fade replaces the slide and the scale; a swipe still follows the finger; the height changes at once.
- **No save button:** each change applies at once.

### Buttons

- **Shape:** a 0.625rem squircle radius; 2.75rem tall.
- **Default:** `surface-2` fill, `ink` text, Control type, 0 1rem padding. An optional icon sits 0.375rem from the label.
- **Hover / Press:** `surface-3` fill under a fine pointer and while pressed; a press scales to 0.97 in 120ms.
- **Disabled:** `ink-4` text at 60% opacity.
- **Focus:** the global focus ring, 2px solid `ink-3`, 2px out.
- **Stepper:** the −Step and +Step buttons of a number input. At least 3.5rem square, a 0.875rem squircle radius, `surface-2`, 1.0625rem at 600 with tabular figures. A press scales to 0.95 on `surface-3`.

### Inputs / Fields

- **Number field:** Display type in `ink`, centered, transparent, with no border and no outline. The placeholder is `ink-3`. A caption in `ink-3` sits under it. The field applies a typed value after a 700ms pause, on Enter, and on blur.
- **Text field:** a `field` fill, `ink` text, a 0.625rem squircle radius, 0.75rem by 0.875rem padding. At least 5.5rem tall; it grows with its content (`field-sizing: content`) up to 40% of the viewport height. No resize handle.
- **Focus:** a text field shows an inset 1.5px ring in `ink-4`. Other controls use the global focus ring.

### Option list

The Options of a choice or a scale Day, as a radio list.

- **Option:** at least 2.875rem tall, 0.5rem by 0.75rem padding, a 0.625rem squircle radius, Body type at 500 in `ink-2`. The label wraps to two lines, then ends with an ellipsis.
- **Leading mark:** a choice shows its emoji in a 1.25rem box. A scale shows a 1.25rem gauge at the Option's level, from the lightest to full.
- **Checked:** `surface-2` fill, `ink` text, and a bold Phosphor check at the end that fades in and grows from 0.9 in 160ms.
- **Hover / Press:** `surface-2` under a fine pointer; a press scales to 0.985.
- **After a pick:** the sheet stays open for 220ms, so the check is seen, then closes.

### Toast capsule

- **Shape:** a pill (infinite radius, `superellipse(1.5)`), 2.875rem tall, as wide as its content up to the window width less 2rem.
- **Color:** `toast` fill with `toast-ink` text. No shadow.
- **Content:** the message (0.9375rem at 500, one line with an ellipsis), then the action 1.25rem after it. Padding is 0 0.5rem 0 1.375rem with an action, and 1.375rem on both sides without one.
- **Action:** a pill 2.25rem tall, Control type. Under a fine pointer it takes 8% of `toast-ink`; while pressed, 12% and a scale of 0.96.
- **Position:** bottom center, 1.5rem from the bottom on a desktop and the safe-area inset plus 1rem on a phone. At most three are visible, 8px apart.
- **Timing:** a plain message stays 4s, an Undo 6s, and "Couldn't save" with Retry 8s. Only one save error shows at a time.
- **Reduced motion:** a 180ms fade.

### Habit form (create and edit)

The create sheet (`?new=true`) and the edit sheet (`?edit=<id>`), in `features/habit-form/`. On a desktop the dialog is 25rem wide, not 22rem, so 8 color swatches and the Option rows have room.

- **Steps:** create has two steps, after Family: the icon, the name, the color, the Kind and the Direction; then the fields of a number, choice or scale habit. The icon picker is a step of its own. The old step leaves in 140ms with a 2px blur and a 20px shift away; the new one comes in from the side it lies on with the morph spring and a 220ms fade. The sheet's height morphs between them. Under reduced motion, a crossfade.
- **Icon tile:** 4.5rem, a 1.25rem squircle, the habit icon at 2.375rem on 16% of the habit color mixed into `surface` (in OKLab: an OKLCH mix turns the tint pink on white). The tint rises from the bottom like a Day, with the fill spring and the gauge's pulse, when the create sheet opens (after 220ms, so the sheet has come up) and when the color changes. A new icon crossfades from 0.9 with a 2px blur.
- **Fields:** the field fill, a 0.625rem squircle, 3rem tall (the name 3.25rem, at Title type), 0.875rem side padding, the `ink-4` inset ring on focus. A label above a field is 0.875rem at 500 in `ink-3`.
- **Segmented control:** a radio group on a `surface-2` track with a 0.125rem inset; the chosen segment gets a pill (`surface`, `surface-3` in the dark theme) that slides with the lift spring. The Kind segments put a bold Phosphor icon over a Caption label. A quiet line in `ink-3` under the control says what the choice means, and crossfades when it changes.
- **Color swatches:** the 16 colors, 8 on a row, each a 72% squircle in its cell. The chosen one gets a 2px `surface` gap and a 2px ring in its color, and a bold check in `ground`.
- **Primary button:** one per step, the action that ends it ("Next", "Add habit"): `ink` fill, `ground` text, full width, otherwise the default button. Its label crossfades when it changes.
- **Sticky footer:** the buttons that end a step stick to the bottom of the sheet while a long step scrolls, with a 1rem fade above them. (`MorphHeight` clips with `overflow: clip`, which is not a scroll container, so `position: sticky` works inside it.)
- **Messages:** a calm line under its field, 0.875rem in `ink-2`, no red, no shake. It opens with the morph spring and fades in.
- **Options:** a row per Option: a gauge at the Option's level (scale only), a 3rem emoji field, the label field, a remove button and a drag handle. Rows enter and leave with the morph spring on their height and a fade (a removal fades in 120ms). A dragged row lifts onto `surface` with the elevation. Retired Options wait under the list, struck through in `ink-3`, with Restore.
- **Taps preview:** under the number fields, up to five 1.25rem gauges show the fill of each tap, and a line counts the taps that fill the day ("reach the limit" for a quit habit).
- **Icon picker:** a search field (an emoji typed there can be used as it is), Icons or Emoji, and a grid of 2.75rem cells in a fixed-height area that scrolls. The chosen cell takes 18% of the habit color and a ring at 70%.

### Habit page

The page of one habit (`/habits/$habitId`), in `features/habit-page/`.

- **Bar:** back (a bold Phosphor caret in `ink-2`, a 44px target) at the left, "Edit" (1rem at 500 in `ink-2`) at the right; both `ink` under a fine pointer and press to 0.96. The bar has the safe-area inset at the top.
- **Title:** the habit icon at 1.75rem and the name at 1.5rem, 600, `ink`, -0.02em, 0.75rem apart, the icon on the first line. The name wraps (it is the page's `h1`). The description sits under the name in `ink-3` at 0.9375rem.
- **Year grid:** 52 Monday weeks of `DaySquare`s that end with the week of today, as wide as the column: the side is the column width over 52, less the gap (0.09375rem), from a container query. The frame is 0.0625rem; the grid does not animate. Each Month is a button over its columns: its label (Label size in `ink-3`; the shown Month in `ink` at 600) and its squares. The labels are short names, or first letters when the grid is narrower than 23rem. Under a fine pointer a Month takes 6% of `ink`.
- **Calendar:** the Month (Title type) with "Today" (only when another Month shows) and two carets, the weekday letters, and the Days in 7 columns, always 6 rows. A Day is its date (0.75rem at 500, tabular, `ink-3`; today `ink` at 700) over a gauge of up to 2.375rem, never wider than its column less 0.375rem. A choice shows its emoji in the square.
- **Paging:** the track follows the finger 1:1 with a rubber band at the current Month, and settles with the sheet spring and the finger's speed. A flick (above 0.11 px/ms on average over 16px, still moving at the lift) turns the page. A change from the keyboard is instant. Under reduced motion a new page fades in.
- **Hold:** a Day presses to 0.95 in 120ms; a hold adds a linear shrink on `scale`, to 0.9 in all, over the time to the paint (200ms) or the input (450ms).
- **From the list:** the row's icon and name grow into the title (a view transition with the sheet spring); the rest crossfades in 200ms, 180ms under reduced motion, where the plate does not move.
- **Under edit, on a phone:** the page rises with the sheet spring until the Day is 16px above the input sheet, and comes back when the sheet closes.
- **Empty state:** a ghost gauge, "This habit is not here" (Title type), a line in `ink-3`, and a "Back to habits" button.

### Motion grammar

All motion comes from the presets in `@/components/motion`, after Family: springs that settle quickly, a short overshoot when a value rises, and sheets that change their height instead of cutting.

- **Springs (Motion):** fill (visual duration 0.38s, bounce 0.24), sheet (0.42s, bounce 0.1), morph (0.34s, bounce 0.12), and pulse (stiffness 600, damping 18, mass 1, start velocity 1.6, a peak of about 1.04). `installCssSprings()` puts the fill and sheet springs on the document as `--spring-fill` and `--spring-sheet` (`linear()` easings), so CSS and JS motion match.
- **Curves:** `--ease-out` (`cubic-bezier(0.23, 1, 0.32, 1)`) for every plain transition; `--ease-drawer` (`cubic-bezier(0.32, 0.72, 0, 1)`) for the bottom sheet and its scrim.
- **Durations:** a press 120ms; a color change 120ms; a check mark or a frame 160ms; a popover 180ms; a dialog, a drain and a reorder 200ms; the sheet scrim 400ms.
- **Presses:** larger elements press less. A Day and a stepper press to 0.95, the close button and the toast action to 0.96, a button to 0.97, an option to 0.985, the ghost row to 0.99.
- **Reduced motion:** a fade replaces each movement (180ms with `--ease-out`). Components read `useReducedMotion()` and drop transforms. A swipe still follows the finger.

### Named Rules

**The Rise Pulses Rule.** A value that rises springs up and pulses to about 1.04. A value that falls drains in 200ms with no bounce.

**The One Grammar Rule.** Every screen uses the springs and durations in `components/motion.ts`. A new screen does not invent its own curve.

## Do's and Don'ts

### Do:
- **Do** put a habit's color in scope with `habitColorStyle(color)` (`--c`) and draw from it: the gauge, the icon, `text-habit`, `bg-habit`, `border-habit`.
- **Do** use `DaySquare` for every Day on every screen, in your own button with a touch target of about 44px. Set `animated={false}` for a large static grid and a thinner `--ds-frame` (0.0625rem) for a small square.
- **Do** round every corner with `corner-shape: squircle` and the 1.75 multiplier: the `squircle-*` utility, or `calc(<radius> * var(--squircle-k))`.
- **Do** write measures in rem, so the desktop's 20px base scales them, and keep the content in the 600px column.
- **Do** set text in the four inks: `ink` for primary text, `ink-2` for habit names, `ink-3` for secondary text and the day header, `ink-4` for the ghost row and disabled controls.
- **Do** open every form and input with `ResponsiveSheet`: a bottom sheet on a phone, a dialog or a popover at 640px and more.
- **Do** give every movement a reduced-motion fade of 180ms, and keep a swipe under the finger.
- **Do** use tabular figures for dates, steppers and number fields.
- **Do** check both themes: light is the default, dark comes from `prefers-color-scheme`.

### Don't:
- **Don't** put a habit on a card, a panel or a tile, and don't separate rows with lines or dividers. Space separates them.
- **Don't** use habit color for names, UI text, buttons, focus rings or overlays. It stays on the icon and the gauge.
- **Don't** give anything that sits on the ground a drop shadow, the toast included. Shadows are for overlays and the lifted row.
- **Don't** show a Day's state by color alone: an empty Day is a frame, a filled Day has a fill.
- **Don't** pulse or bounce on a fall. A drain is 200ms with `--ease-out`.
- **Don't** hard-code a radius without the squircle multiplier.
- **Don't** add a second typeface, uppercase eyebrows or kickers, or letter-spaced labels.
- **Don't** set the text of a field under 16px.
- **Don't** style a quit habit differently from a build habit, and don't draw streaks, percentages or badges.
- **Don't** add a theme switch or a `.dark` class; the theme is the system setting.
