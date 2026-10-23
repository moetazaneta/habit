# The lab

The lab lets you try UI ideas in the running app. A component declares a choice or a flag. The
lab panel at the bottom left of `vp dev` switches it live, and the pick survives a reload
(localStorage, key `habit:lab`). The panel lists only the controls of the components on screen,
and it hides when there are none.

A production build has no panel. Every choice renders its first option and every flag its initial
value, so an unfinished experiment changes nothing for the user. Tests get the same defaults.

The code is in `apps/web/src/components/lab`.

## Try several components in one place

`Variants` takes the candidates by the name the panel shows, and the props they all get:

```tsx
import { Variants } from "@/components/lab";

<Variants
  id="new-habit"
  label="New habit button"
  options={{ "Ghost row": GhostRow, "Dashed tile": DashedTile, Pill }}
  props={{ days, onClick }}
/>;
```

A candidate may use only some of the props. The panel numbers the options, so "option 3" names
one in a conversation.

## A choice that touches more than one place

`useVariant` returns the picked name. Use it when the candidates differ in more than one spot,
such as a button that moves from the list to the header:

```tsx
const placement = useVariant("new-habit-place", {
  label: "New habit placement",
  options: ["end of list", "header"],
});
```

Two components may read the same id. The control stays in the panel while either of them is
mounted.

## A flag

`useLabFlag` is a checkbox in the panel, for a detail to turn on and off:

```tsx
const dense = useLabFlag("dense-rows", { label: "Dense rows" });
```

## When the idea is decided

1. Replace the `Variants`, `useVariant` or `useLabFlag` call with the winner.
2. Delete the other candidates and their CSS.
3. Search for the id to check that nothing else reads it.

The stale pick in localStorage does no harm: the lab ignores a value for a control that no longer
exists, and falls back to the first option when the picked one is gone.
