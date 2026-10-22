# web-list: notes

The notes of the web-list milestone: A, the design foundation of the web app, and B, the habit
list and the input of a value.

## A: the design foundation

### What the other screens can use

All of it is in `apps/web/src/components/`.

| Import | What it does |
| --- | --- |
| `DaySquare` from `@/components/day-square` | The gauge of one Day. Props: `color`, `intensity` (0 to 1), `size` (a CSS length, default `var(--square)`), `variant` (`day`, `ghost`, `future`), `animated` (default true; turn it off for a large static grid), `label`. It is only the picture: wrap it in your own button. |
| `HabitIcon`, `PHOSPHOR_ICON_GROUPS`, `preloadHabitIcons` from `@/components/habit-icon` | The icon of a habit: a Phosphor duotone icon in the habit color, or an emoji. `PHOSPHOR_ICON_GROUPS` is the curated list for an icon picker (about 200 names in 12 groups). |
| `ResponsiveSheet`, `MorphHeight` from `@/components/sheet` | A bottom sheet on a phone (Base UI Drawer, swipe down to dismiss), a centered dialog or an anchored popover on a desktop (`desktop="dialog" \| "popover"`, `anchor`). The content morphs its height with a spring. |
| `useSheetSearch`, `useOpenSheet`, `useCloseSheet`, `entryRef`, `parseEntryRef` from `@/components/sheet-search` | The sheet search params (`?new`, `?edit`, `?entry`). Open with `useOpenSheet()({ edit: id })`; close with `useCloseSheet()()`, which goes back when the app opened the sheet, so the back gesture and the close button agree. |
| `useRetained` from `@/components/use-retained` | Keeps the last search param while a sheet animates out. |
| `useAct` from `@/components/act` | Performs an Action with the feedback: an optional Undo toast (`act(action, { undo: "Habit deleted" })`), and "Couldn't save" with Retry when the write fails. |
| `toastUndo`, `toastSaveError`, `toastMessage` from `@/components/toast` | The toast capsule (Sonner, headless). The one `<AppToaster />` is in the root route. |
| `springs`, `durations`, `PULSE_VELOCITY` from `@/components/motion` | The motion presets for Motion (`motion/react`). `--spring-fill` and `--spring-sheet` are the same springs for CSS transitions. |
| `habitColorStyle`, `habitColorVar` from `@/components/palette` | Puts a habit color in scope as `--c`; then `text-habit`, `bg-habit` and `border-habit` use it. |
| `useIsWide`, `useMediaQuery` from `@/components/use-media-query` | The wide layout (at 640px and more: 7 Days, a 20px base, dialogs instead of sheets). |
| `haptic` from `@/components/haptics` | A short haptic tick where the browser can give one. |

Tokens (in `apps/web/src/styles.css`, both themes): `ground`, `ink` to `ink-4`, `line`,
`line-strong`, `surface` to `surface-3`, `toast`, `toast-ink`, as Tailwind colors (`bg-ground`,
`text-ink-3` and so on), the 16 `--habit-*` colors, and the list's measures (`--gutter`, `--row`,
`--icon`, `--square`, `--square-gap`). The `squircle-*` utility gives squircle corners with a radius
fallback. The shadcn variables map onto these tokens, so a shadcn component wears the world.

### Decisions and assumptions

- **Theme by the system setting only.** `dark:` is the `prefers-color-scheme` media query, not a
  class. There is no theme switch.
- **Light palette.** The owner's 16 dark values, darkened to about L 0.64 with the same chroma, so a
  full square has 3.3:1 against white. The frame of a partial square takes 40% of the habit color
  in the light theme (35% in the dark theme, as the owner set), because a 35% frame was too faint
  on white.
- **Light toast.** The toast capsule is inverted in the light theme (dark capsule, light text), so
  an Undo is never missed on white. The dark theme keeps the sketch's `#1c1c1e` capsule.
- **Ghost text contrast.** The sketch's `#636366` for the "New habit" text is 3.5:1 on black,
  under WCAG AA. It is `#7c7c80` (5:1) instead.
- **Desktop.** At 640px and more, the root font size is 20px, so every rem in the app scales by
  1.25, and the layout is a 600px column.
- **Sheets.** Base UI's Drawer (already in the app, and Base UI is the curated pick for dialogs and
  popovers) is the phone sheet; Dialog and Popover are the desktop forms. The phone sheet floats
  8px above the bottom edge with large squircle corners, as in Family.
- **Icons.** A curated catalog of about 200 Phosphor icons, each loaded as its own small chunk, not
  the whole set of 1,500. A name outside the catalog draws a circle. To add an icon, add a line to
  `components/habit-icon/catalog.ts`.
- **Motion.** The gauge fill is a CSS transition with Motion's spring as a `linear()` easing, so a
  fast series of taps retargets it. The pulse to about 1.04 is a physical spring started with a
  velocity. Under reduced motion the fill changes in place with a short fade, and sheets fade.
- **Fake data knobs.** In fake mode, `VITE_HABIT_FAKE_LATENCY_MS` and `VITE_HABIT_FAKE_FAIL=true`
  (in `apps/web/.env.development.local`, which git ignores) show the pending and the failed states.
