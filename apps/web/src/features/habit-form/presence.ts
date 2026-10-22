import type { Transition } from "motion/react";

import { springs } from "@/components/motion";

/** The strong ease-out of the app (`--ease-out`), for the fades and crossfades of the form. */
export const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/** A fade in, and the faster fade out: a removal is the system's answer, so it snaps. */
export const FADE_IN: Transition = { duration: 0.18, ease: EASE_OUT };
export const FADE_OUT: Transition = { duration: 0.12, ease: EASE_OUT };

/**
 * The presence of a row that enters or leaves a list (an Option, a message), after Family's
 * drawers: the height opens with the morph spring while the row fades in; on exit the text goes
 * fast and the gap closes. The overflow clips only while the height moves, so a dragged row or a
 * focus ring is never cut. Under reduced motion, a fade only.
 */
export function rowPresence(reduceMotion: boolean) {
  if (reduceMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: FADE_IN },
      exit: { opacity: 0, transition: FADE_OUT },
    } as const;
  }
  return {
    initial: { opacity: 0, height: 0, overflow: "hidden" },
    animate: {
      opacity: 1,
      height: "auto",
      transitionEnd: { overflow: "visible" },
      transition: { height: springs.morph, opacity: { duration: 0.22, ease: EASE_OUT } },
    },
    exit: {
      opacity: 0,
      height: 0,
      overflow: "hidden",
      transition: { height: springs.morph, opacity: FADE_OUT },
    },
  } as const;
}
