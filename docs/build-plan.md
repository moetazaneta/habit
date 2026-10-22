# v1 build plan

How the v1 build runs in parallel. The owner is away during the build: do not ask the owner
questions. Decide from `docs/v1.md`, `PRODUCT.md`, `GLOSSARY.md`, the ADRs and this file, and
write each assumption to your own notes file (see "Notes").

## Contracts

The contracts are on `main`. Change a contract only when you must, in a small separate commit
(`refactor(core): …` or `refactor(data): …`) that says why, and keep the old name working when other
threads use it.

- **`@habit/core`** (`packages/core`): the domain types and the pure rules. Each function has its
  rule in its doc comment; the stubs throw until the core thread implements them.
- **`@habit/data`** (`packages/data`): `HabitDataApi` in `src/api.ts` and the hooks `useAuth`,
  `useHabits`, `useHabit`, `useHabitState`, `useEntries`, `useMonth`, `usePerform`. The apps use only these hooks
  and the two providers:
  - `HabitDataProvider`: Convex and Clerk.
  - `FakeHabitDataProvider` from `@habit/data/testing`: in memory, with `demoState(today)`, for
    tests and for UI work without a backend.
- **Data mode of the web app:** `VITE_HABIT_DATA=fake` uses the fake provider with the demo data;
  otherwise the app uses `HabitDataProvider`.
- **URL:**
  - `/`: the habit list.
  - `/habits/$habitId`: the page of a habit.
  - The sheets are search params on any route, so they open over the list and over the habit
    page, and the back gesture closes them:
    - `?new=true`: create a habit.
    - `?edit=<habitId>`: edit a habit.
    - `?entry=<habitId>:<day>`: the input of a value.
  - The root route validates these search params.
- **The design direction:** `apps/web/.impeccable/surfaces/src-routes-index-tsx.md` (the direction
  contract) and the chosen sketch `apps/web/.impeccable/mocks/decision/r3-color-icons.html`.

## Decisions for the build

- **Themes:** dark and light, by the system setting. Dark: pure black `#000`. Light: the same
  structure on white.
- **Type:** IBM Plex Sans (self-hosted with Fontsource, not a Google Fonts link). Tabular figures
  for numbers.
- **Corners:** squircle, `corner-shape: superellipse(2)` with a `border-radius` fallback. Start
  from the owner's Tailwind utility in `~/repos/tem.sh/src/styles/utilities.css` (`squircle-*`).
  Its `@supports (border-radius: superellipse(1.5))` test never matches; test
  `@supports (corner-shape: squircle)` instead.
- **Palette:** the 16 ids of `HABIT_COLORS` in `@habit/core`. Dark theme values (muted, about OKLCH
  L 0.68–0.75, C 0.04–0.10):

  | Id | Dark | Id | Dark |
  | --- | --- | --- | --- |
  | rose | #d08a8a | jade | #76b3a0 |
  | apricot | #d6a37a | teal | #79b8b5 |
  | ochre | #c9a46a | sky | #6ab0ca |
  | sand | #b8a07a | blue | #6f9bd1 |
  | mustard | #bbb06b | slate | #8f9bb3 |
  | olive | #9fb878 | violet | #a58fd0 |
  | green | #7fae8a | mauve | #c39bb8 |
  | raspberry | #c68198 | stone | #a39d97 |

  The light theme needs its own muted values that keep the intensity steps clear on white.
- **Icons:** Phosphor, the duotone weight, in the habit color (`@phosphor-icons/react`). Emoji
  icons are also allowed (`HabitIcon`).
- **Errors:** a failed write rolls back on screen, and a toast says "Couldn't save" with "Retry".
  No shake, no red.
- **Undo toasts:** after a paint, a delete and other bulk changes. Sonner.
- **Skills to use:** impeccable, emil-design-eng, mobile-native, animate, review-animations,
  break-ui, pick-ui-library, ask-sonner, shadcn.

## Milestones and ownership

Each milestone runs in its own T3 thread and its own worktree. Stay inside the files you own.
Small additive edits to another owner's file are acceptable when unavoidable: say so in the commit
body.

| Milestone | Owns | Starts |
| --- | --- | --- |
| **core**: implement `@habit/core` (test-first), then `FakeHabitDataProvider` and `demoState` | `packages/core/**`, `packages/data/src/testing/**` | now |
| **data**: Convex dev deployment, Clerk dev instance (Google), schema and functions, `authQuery` / `authMutation`, `HabitDataProvider`, optimistic updates, the IndexedDB snapshot | `packages/data/**` except `src/testing` | now |
| **web-list**: A, the design foundation; then B, the habit list and the input of a value | `apps/web/src/styles.css`, `apps/web/src/main.tsx`, `apps/web/src/routes/__root.tsx`, `apps/web/src/routes/index.tsx`, `apps/web/src/components/**`, `apps/web/src/features/list/**`, `apps/web/src/features/entry-input/**`, `DESIGN.md` (written from the built world) | now |
| **web-habit-page**: the grid of 12 months and the calendar | `apps/web/src/routes/habits.$habitId.tsx`, `apps/web/src/features/habit-page/**` | after web-list A is on `main` |
| **web-habit-form**: create and edit (sheet on a phone, dialog on a desktop), delete with undo | `apps/web/src/features/habit-form/**` | after web-list A is on `main` |
| **integration**: sign-in and "no access" screens, the real provider in the app, an end-to-end check, the finish review across the screens | `apps/web/src/features/auth/**` | after data and web-list B |

web-list A must provide, for the other screens: the theme tokens, the font, the squircle utility,
the palette mapping, `DaySquare` (the gauge), `HabitIcon`, a responsive sheet (a bottom sheet on a
phone, a dialog or popover on a desktop), the toast setup, the motion presets, and the mount points
in the root route for the sheets of the search params. web-list A ends with a commit whose subject
starts with `feat(web): design foundation`.

## Merge protocol

There are no pull requests: each thread merges into `main` itself.

1. Commit small steps on your branch (Conventional Commits, see AGENTS.md).
2. To merge: `git fetch origin && git rebase origin/main`, then `vp install`, then
   `vp run ready`. It must pass.
3. `git push origin HEAD:main`. When the push is rejected, go back to step 2. Never force-push
   `main`.
4. On a lockfile conflict, take the lockfile of `origin/main` and run `vp install` again.
5. Merge often, at least after each working step, so the other threads build on current code.
6. After the push, check the CI run: `gh run list --branch main --limit 3`.

## Notes

Each thread keeps `docs/notes/<milestone>.md`: what it built, its assumptions, open questions for
the owner, and what the owner must do by hand (for example, a command to run once). The
orchestrator collects them for the owner.
