# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

A Vite+ workspace on pnpm: a React SPA with TanStack Router, Tailwind CSS and shadcn/ui
(base-nova, on Base UI). The backend is Convex. Clerk does the sign-in (Google first). v1 is a
mobile-first web app, served as a static SPA from Vercel. A custom domain is not chosen yet.

## Users

One person: the owner. The owner uses the app on a phone, a few times each day, to record the
habits of that day. Sometimes the owner fills in past days. The owner also opens the app on a
desktop computer.

## Product Purpose

A habit tracker, similar to HabitKit. The person records a value for each habit on each day, and
sees the history of each habit as a grid of squares. Success: to record a day takes less effort
than in HabitKit, and the app is pleasant to open many times each day.

## Positioning

Input speed and care for detail. The person records days directly in the habit list and in the
calendar: a tap changes a day, a drag over the days fills them, and no change needs a save button.
The look stays quiet, but each interaction has a considered detail or animation.

## Operating Context

- The main screen is the habit list. Each row shows the icon, the name and the last days as
  squares: 5 days on a narrow (phone) screen, 7 days on a wide screen. Today is the square at
  the right.
- The page of a habit shows its icon and name, a grid of the last 12 months, and a calendar with
  one month on each page. The person swipes between months.
- On a phone, the create, edit and input forms open as bottom sheets. On a desktop, they open as
  dialogs and popovers. The desktop layout is the phone layout in a 600px column, with a base
  font size of 20px.

## Capabilities and Constraints

- Terms: see [GLOSSARY.md](./GLOSSARY.md).
- v1: the habit list, the page of a habit (grid and calendar), create and edit a habit, delete a
  habit, and manual order of the habits.
- Kinds of habit: check, number, choice, scale and text. A habit has a Direction: build or quit.
- One user (the owner), with a sign-in. The app is online-first: each change shows immediately,
  and the server confirms it later. Offline use is not in v1, but the data model keeps it
  possible.
- Planned for v2: archive, import and export of the data, an installable PWA, and an undo
  history with Cmd+Z.
- Undecided, and maybe never: streaks and statistics. Later: reminders and widgets.
- The UI language is English. The theme (light or dark) follows the system setting.

## Brand Commitments

- The working name is "Habit".
- References that the owner made binding: Family, for the motion; Linear, for the care for
  detail and the simplicity.
- A calm look with a minimum of decoration. No cards inside cards.
- Each habit has an icon (an emoji or a Phosphor icon) and a color from a fixed palette.

## Evidence on Hand

No real content, users, testimonials or data exist yet. HabitKit is the reference product. Do not
invent testimonials, numbers or claims.

## Product Principles

1. **Input first.** To record a day takes one tap, from the list. Bulk input (a drag over days) is
   a first-class action.
2. **Quiet surface, deep detail.** The look stays calm. The care goes into interactions, motion
   and edge cases.
3. **Never wait.** Each change shows immediately. The app offers undo, not confirmation dialogs.
4. **No judgment.** No streak pressure. A quit habit looks the same as a build habit. A day without
   an entry has no data: it is not a failure.
5. **One product on each screen.** The desktop app is the phone app with more room.

## Accessibility & Inclusion

- Text contrast meets WCAG 2.2 AA.
- The intensity levels of the squares are clear in the light theme and in the dark theme. An empty
  square and a filled square differ in shape, not only in color.
- With `prefers-reduced-motion`, a fade replaces each movement.
- Touch targets are approximately 44px, also where the visible square is smaller.
